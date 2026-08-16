import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Combatant, CombatantSpellSlotLevel, CombatantType } from '../../core/entities/combatant';
import { CombatantPreset } from '../../core/entities/combatant-preset';
import {
    BookMarkedIcon,
    DownloadIcon,
    LucideAngularModule,
    LoaderIcon,
    PencilIcon,
    PlusIcon,
    SaveIcon,
    SearchIcon,
    SwordsIcon,
    Trash2Icon,
    UploadIcon,
} from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/i18n/language.service';
import { SupportedLanguage } from '../../core/i18n/i18n';
import { LibraryStorageService } from '../../core/library/library-storage.service';
import { LibrarySerializerService } from '../../core/library/library-serializer.service';
import { ModalFocusTrapDirective } from '../../shared/modal-focus-trap.directive';
import { MODAL_ANIMATION_DIRECTIVES } from '../../shared/modal-animation.directive';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_CHARS = 3;

@Component({
    selector: 'app-library-manager-modal',
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        TranslatePipe,
        ModalFocusTrapDirective,
        MODAL_ANIMATION_DIRECTIVES,
    ],
    templateUrl: './library-manager-modal.html',
    styleUrl: './library-manager-modal.scss',
})
export class LibraryManagerModal implements OnInit, AfterViewInit {
    @Input() combatantToSave: Combatant | undefined;

    @Output() close = new EventEmitter<void>();
    @Output() loadPresets = new EventEmitter<
        { presets: CombatantPreset[]; quantity: number; rollInitiative: boolean }[]
    >();
    @Output() saveToLibrary = new EventEmitter<CombatantPreset>();

    libraryName = '';
    presets: CombatantPreset[] = [];
    messageKey: string | null = null;
    messageTone: 'success' | 'error' = 'success';

    editingPreset: CombatantPreset | undefined;
    presetFormName = '';
    presetFormPresetName = '';
    presetFormType: CombatantType = 'NPC';
    presetFormAc = 10;
    presetFormHp = 1;
    presetFormInitiativeBonus = 0;

    loadingPresetId: string | null = null;
    loadQuantity = 1;
    loadRollInitiative = false;

    showDirtyConfirm = false;
    pendingImportFile: File | null = null;

    importLoading = false;

    searchQuery = '';
    visibleCount = PAGE_SIZE;
    private searchTimeout: ReturnType<typeof setTimeout> | null = null;
    protected pendingSearchQuery = '';

    @ViewChild('presetsScrollContainer') presetsScrollContainer!: ElementRef<HTMLElement>;
    @ViewChild('nameInput') set nameInput(input: ElementRef<HTMLInputElement> | undefined) {
        if (!input) return;
        setTimeout(() => input.nativeElement.focus());
    }

    constructor(
        protected languageService: LanguageService,
        private libraryStorage: LibraryStorageService,
        private librarySerializer: LibrarySerializerService,
    ) {}

    ngOnInit() {
        const library = this.libraryStorage.loadLibrary();

        if (library) {
            this.libraryName = library.name;
            this.presets = library.presets;
        }

        if (this.combatantToSave) {
            this.prefillFromCombatant(this.combatantToSave);
        }
    }

    ngAfterViewInit() {
        if (!this.combatantToSave) {
            setTimeout(() => {
                const input = document.querySelector<HTMLInputElement>('#library-name-input');
                input?.focus();
            });
        }
    }

    saveLibrary() {
        const name = this.libraryName.trim();

        if (!name) {
            this.setMessage('library.nameRequired', 'error');
            return;
        }

        const library = this.librarySerializer.buildLibrary(name, this.presets);
        const savedLibrary = { id: crypto.randomUUID(), ...library };

        this.libraryStorage.persistLibrary(savedLibrary);
        this.libraryStorage.markClean();
        this.libraryStorage.setLoadedFileName(null);
        this.setMessage('library.saved', 'success');
    }

    savePreset() {
        const presetName = this.presetFormPresetName.trim();

        if (!presetName) {
            this.setMessage('library.presetNameRequired', 'error');
            return;
        }

        const preset: CombatantPreset = {
            id: this.editingPreset?.id ?? crypto.randomUUID(),
            presetName,
            name: this.presetFormName.trim(),
            type: this.presetFormType,
            armorClass: Math.max(1, this.presetFormAc),
            maxHp: Math.max(1, this.presetFormHp),
            initiativeBonus: this.presetFormInitiativeBonus,
        };

        this.presets = this.libraryStorage.savePreset(preset);
        this.clearPresetForm();
        this.resetPagination();
        this.setMessage('library.presetSaved', 'success');
    }

    editPreset(preset: CombatantPreset) {
        this.editingPreset = preset;
        this.presetFormPresetName = preset.presetName;
        this.presetFormName = preset.name;
        this.presetFormType = preset.type;
        this.presetFormAc = preset.armorClass;
        this.presetFormHp = preset.maxHp;
        this.presetFormInitiativeBonus = preset.initiativeBonus;
    }

    deletePreset(id: string) {
        this.presets = this.libraryStorage.deletePreset(id);

        if (this.editingPreset?.id === id) {
            this.clearPresetForm();
        }

        this.resetPagination();
        this.setMessage('library.presetDeleted', 'success');
    }

    toggleLoadPreset(presetId: string) {
        if (this.loadingPresetId === presetId) {
            this.loadingPresetId = null;
        } else {
            this.loadingPresetId = presetId;
            this.loadQuantity = 1;
            this.loadRollInitiative = false;
        }
    }

    confirmLoadPreset(preset: CombatantPreset) {
        const quantity = Math.max(1, Math.min(50, Math.floor(this.loadQuantity) || 1));

        this.loadPresets.emit([
            {
                presets: [preset],
                quantity,
                rollInitiative: this.loadRollInitiative,
            },
        ]);

        this.loadingPresetId = null;
        this.setMessage('library.loaded', 'success');
    }

    exportLibrary() {
        if (!this.presets.length) {
            this.setMessage('library.noPresetsToExport', 'error');
            return;
        }

        const name = this.libraryName.trim() || this.defaultLibraryName();
        const library = this.librarySerializer.buildLibrary(name, this.presets);

        this.librarySerializer.downloadLibrary(library);
        this.libraryStorage.markClean();
        this.libraryStorage.setLoadedFileName(this.librarySerializer.slugify(name) + '.json');
        this.setMessage('library.exported', 'success');
    }

    importLibraryFile(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        input.value = '';

        if (this.libraryStorage.isDirty()) {
            this.pendingImportFile = file;
            this.showDirtyConfirm = true;
        } else {
            this.readAndApplyImport(file);
        }
    }

    confirmImportSaveAndLoad() {
        if (this.pendingImportFile) {
            this.saveLibrary();
            this.readAndApplyImport(this.pendingImportFile);
        }

        this.showDirtyConfirm = false;
        this.pendingImportFile = null;
    }

    confirmImportDiscard() {
        if (this.pendingImportFile) {
            this.libraryStorage.markClean();
            this.readAndApplyImport(this.pendingImportFile);
        }

        this.showDirtyConfirm = false;
        this.pendingImportFile = null;
    }

    confirmImportCancel() {
        this.showDirtyConfirm = false;
        this.pendingImportFile = null;
    }

    prefillFromCombatant(combatant: Combatant) {
        this.editingPreset = undefined;
        this.presetFormPresetName = combatant.name;
        this.presetFormName = '';
        this.presetFormType = combatant.type;
        this.presetFormAc = combatant.armorClass;
        this.presetFormHp = combatant.maxHp;
        this.presetFormInitiativeBonus = combatant.initiative;
    }

    formatLibraryDate(value: string): string {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat(this.languageService.currentLanguage, {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date);
    }

    getPresetStats(preset: CombatantPreset): string {
        return `CA ${preset.armorClass} · PV ${preset.maxHp} · Ini ${preset.initiativeBonus >= 0 ? '+' : ''}${preset.initiativeBonus}`;
    }

    onSearchInput(value: string) {
        this.pendingSearchQuery = value;

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            this.searchQuery = this.pendingSearchQuery;
            this.visibleCount = PAGE_SIZE;
        }, SEARCH_DEBOUNCE_MS);
    }

    get filteredPresets(): CombatantPreset[] {
        const query = this.searchQuery.trim().toLowerCase();

        if (query.length < SEARCH_MIN_CHARS) {
            return this.presets;
        }

        return this.presets.filter(
            (preset) =>
                preset.presetName.toLowerCase().includes(query) ||
                preset.name.toLowerCase().includes(query),
        );
    }

    get displayedPresets(): CombatantPreset[] {
        return this.filteredPresets.slice(0, this.visibleCount);
    }

    get hasMorePresets(): boolean {
        return this.visibleCount < this.filteredPresets.length;
    }

    loadMorePresets() {
        this.visibleCount += PAGE_SIZE;
    }

    onPresetsScroll(event: Event) {
        const el = event.target as HTMLElement;
        const threshold = 80;

        if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold && this.hasMorePresets) {
            this.loadMorePresets();
        }
    }

    get loadedFileName(): string | null {
        return this.libraryStorage.getLoadedFileName();
    }

    get isDirty(): boolean {
        return this.libraryStorage.isDirty();
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscape(event: Event) {
        event.preventDefault();
        this.close.emit();
    }

    private readAndApplyImport(file: File) {
        this.importLoading = true;

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const json = String(reader.result ?? '');
                const fallbackName = file.name.replace(/\.json$/i, '') || this.defaultLibraryName();

                this.applyImport(json, fallbackName);
            } catch {
                this.setMessage('library.invalidFile', 'error');
            } finally {
                this.importLoading = false;
            }
        };

        reader.onerror = () => {
            this.setMessage('library.invalidFile', 'error');
            this.importLoading = false;
        };

        reader.readAsText(file);
    }

    private applyImport(json: string, fallbackName: string) {
        const library = this.librarySerializer.parseLibraryJson(json, fallbackName);

        this.libraryName = library.name;
        this.presets = library.presets;

        const savedLibrary = { id: crypto.randomUUID(), ...library };

        this.libraryStorage.persistLibrary(savedLibrary);
        this.libraryStorage.markClean();
        this.libraryStorage.setLoadedFileName(fallbackName);
        this.resetPagination();
        this.setMessage('library.imported', 'success');
    }

    clearPresetForm() {
        this.editingPreset = undefined;
        this.presetFormPresetName = '';
        this.presetFormName = '';
        this.presetFormType = 'NPC';
        this.presetFormAc = 10;
        this.presetFormHp = 1;
        this.presetFormInitiativeBonus = 0;
    }

    private resetPagination() {
        this.visibleCount = PAGE_SIZE;
        this.searchQuery = '';
        this.pendingSearchQuery = '';
    }

    private setMessage(key: string, tone: 'success' | 'error') {
        this.messageKey = key;
        this.messageTone = tone;
    }

    private defaultLibraryName(): string {
        const labels: Record<SupportedLanguage, string> = {
            'pt-BR': 'Biblioteca',
            es: 'Biblioteca',
            'en-US': 'Library',
        };

        return `${labels[this.languageService.currentLanguage]} ${new Date().toLocaleDateString(this.languageService.currentLanguage)}`;
    }

    protected readonly BookMarkedIcon = BookMarkedIcon;
    protected readonly DownloadIcon = DownloadIcon;
    protected readonly LoaderIcon = LoaderIcon;
    protected readonly PencilIcon = PencilIcon;
    protected readonly PlusIcon = PlusIcon;
    protected readonly SaveIcon = SaveIcon;
    protected readonly SearchIcon = SearchIcon;
    protected readonly SwordsIcon = SwordsIcon;
    protected readonly Trash2Icon = Trash2Icon;
    protected readonly UploadIcon = UploadIcon;
}

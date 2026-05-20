import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combatant } from '../../core/entities/combatant';
import { DownloadIcon, LucideAngularModule, SaveIcon, Trash2Icon, UploadIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/i18n/language.service';
import { SupportedLanguage } from '../../core/i18n/i18n';
import { EncounterStorageService, SavedEncounter } from '../../core/encounters/encounter-storage.service';
import { EncounterData, EncounterSerializerService } from '../../core/encounters/encounter-serializer.service';
import { ModalFocusTrapDirective } from '../../shared/modal-focus-trap.directive';
import { MODAL_ANIMATION_DIRECTIVES } from '../../shared/modal-animation.directive';

@Component({
    selector: 'app-encounter-manager-modal',
    imports: [CommonModule, LucideAngularModule, TranslatePipe, ModalFocusTrapDirective, MODAL_ANIMATION_DIRECTIVES],
    templateUrl: './encounter-manager-modal.html',
    styleUrl: './encounter-manager-modal.scss'
})
export class EncounterManagerModal implements OnInit {
    @Input({ required: true }) combatants: Combatant[] = [];
    @Input({ required: true }) round = 1;
    @Input() activeCombatantId: string | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() encounterLoaded = new EventEmitter<EncounterData>();

    encounterName = '';
    savedEncounters: SavedEncounter[] = [];
    encounterMessageKey: string | null = null;
    encounterMessageTone: 'success' | 'error' = 'success';

    @ViewChild('encounterNameInput') set encounterNameInput(input: ElementRef<HTMLInputElement> | undefined) {
        if (!input) return;

        setTimeout(() => input.nativeElement.focus());
    }

    constructor(
        protected languageService: LanguageService,
        private encounterStorage: EncounterStorageService,
        private encounterSerializer: EncounterSerializerService
    ) {
    }

    ngOnInit() {
        this.savedEncounters = this.encounterStorage.listEncounters(this.defaultEncounterName());
        this.encounterName = this.defaultEncounterName();
    }

    saveNamedEncounter() {
        const name = this.encounterName.trim();

        if (!name) {
            this.setEncounterMessage('encounter.nameRequired', 'error');
            return;
        }

        this.savedEncounters = this.encounterStorage.saveEncounter(this.buildEncounterData(name));
        this.setEncounterMessage('encounter.saved', 'success');
    }

    loadNamedEncounter(encounter: SavedEncounter) {
        this.encounterName = encounter.name;
        this.encounterLoaded.emit(encounter);
        this.setEncounterMessage('encounter.loaded', 'success');
    }

    deleteNamedEncounter(id: string) {
        this.savedEncounters = this.encounterStorage.deleteEncounter(id, this.defaultEncounterName());
        this.setEncounterMessage('encounter.deleted', 'success');
    }

    exportCurrentEncounter() {
        this.encounterSerializer.downloadEncounter(
            this.buildEncounterData(this.encounterName.trim() || this.defaultEncounterName())
        );
    }

    exportNamedEncounter(encounter: SavedEncounter) {
        this.encounterSerializer.downloadEncounter(encounter);
    }

    importEncounterFile(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const fallbackName = file.name.replace(/\.json$/i, '') || this.defaultEncounterName();
                const encounter = this.encounterSerializer.parseEncounterJson(
                    String(reader.result ?? ''),
                    fallbackName
                );

                this.encounterName = encounter.name;
                this.encounterLoaded.emit(encounter);
                this.setEncounterMessage('encounter.imported', 'success');
            } catch {
                this.setEncounterMessage('encounter.invalidFile', 'error');
            } finally {
                input.value = '';
            }
        };

        reader.onerror = () => {
            this.setEncounterMessage('encounter.invalidFile', 'error');
            input.value = '';
        };

        reader.readAsText(file);
    }

    protected formatEncounterDate(value: string): string {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat(this.languageService.currentLanguage, {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(date);
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscape(event: Event) {
        event.preventDefault();
        this.close.emit();
    }

    private buildEncounterData(name: string): EncounterData {
        return this.encounterSerializer.buildEncounter(
            name,
            this.combatants,
            {
                round: this.round,
                activeCombatantId: this.activeCombatantId
            }
        );
    }

    private setEncounterMessage(key: string, tone: 'success' | 'error') {
        this.encounterMessageKey = key;
        this.encounterMessageTone = tone;
    }

    private defaultEncounterName(): string {
        const labels: Record<SupportedLanguage, string> = {
            'pt-BR': 'Encontro',
            es: 'Encuentro',
            'en-US': 'Encounter'
        };

        return `${labels[this.languageService.currentLanguage]} ${new Date().toLocaleDateString(this.languageService.currentLanguage)}`;
    }

    protected readonly DownloadIcon = DownloadIcon;
    protected readonly SaveIcon = SaveIcon;
    protected readonly Trash2Icon = Trash2Icon;
    protected readonly UploadIcon = UploadIcon;
}

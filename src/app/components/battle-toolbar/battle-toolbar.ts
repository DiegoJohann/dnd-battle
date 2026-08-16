import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import {
    FlameIcon,
    FolderOpenIcon,
    LucideAngularModule,
    MenuIcon,
    PlusIcon,
    Trash2Icon,
} from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { SupportedLanguage } from '../../core/i18n/i18n';

@Component({
    selector: 'app-battle-toolbar',
    imports: [LucideAngularModule, TranslatePipe],
    templateUrl: './battle-toolbar.html',
    styleUrl: './battle-toolbar.scss',
})
export class BattleToolbarComponent {
    @Input({ required: true }) currentLanguage!: SupportedLanguage;
    @Input({ required: true }) supportedLanguages: readonly SupportedLanguage[] = [];
    @Input() empty = false;
    @Input() areaDamageDisabled = false;

    @Output() languageChange = new EventEmitter<string>();
    @Output() openEncounter = new EventEmitter<void>();
    @Output() addCombatant = new EventEmitter<void>();
    @Output() clearBattlefield = new EventEmitter<void>();
    @Output() areaDamage = new EventEmitter<void>();

    protected readonly FlameIcon = FlameIcon;
    protected readonly FolderOpenIcon = FolderOpenIcon;
    protected readonly MenuIcon = MenuIcon;
    protected readonly PlusIcon = PlusIcon;
    protected readonly Trash2Icon = Trash2Icon;

    mobileMenuOpen = false;

    constructor(private elementRef: ElementRef) {}

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMobileMenu(): void {
        this.mobileMenuOpen = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.mobileMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
            this.mobileMenuOpen = false;
        }
    }
}

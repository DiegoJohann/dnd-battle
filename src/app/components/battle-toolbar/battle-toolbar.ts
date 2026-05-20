import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FolderOpenIcon, LucideAngularModule, PlusIcon, Trash2Icon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { SupportedLanguage } from '../../core/i18n/i18n';

@Component({
    selector: 'app-battle-toolbar',
    imports: [LucideAngularModule, TranslatePipe],
    templateUrl: './battle-toolbar.html',
    styleUrl: './battle-toolbar.scss'
})
export class BattleToolbarComponent {
    @Input({ required: true }) currentLanguage!: SupportedLanguage;
    @Input({ required: true }) supportedLanguages: readonly SupportedLanguage[] = [];
    @Input() empty = false;

    @Output() languageChange = new EventEmitter<string>();
    @Output() openEncounter = new EventEmitter<void>();
    @Output() addCombatant = new EventEmitter<void>();
    @Output() clearBattlefield = new EventEmitter<void>();

    protected readonly FolderOpenIcon = FolderOpenIcon;
    protected readonly PlusIcon = PlusIcon;
    protected readonly Trash2Icon = Trash2Icon;
}

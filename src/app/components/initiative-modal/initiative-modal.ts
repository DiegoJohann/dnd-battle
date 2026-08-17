import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckIcon, LucideAngularModule, XIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Combatant } from '../../core/entities/combatant';
import { MODAL_ANIMATION_DIRECTIVES } from '../../shared/modal-animation.directive';
import { ModalFocusTrapDirective } from '../../shared/modal-focus-trap.directive';

export interface InitiativeUpdate {
    combatantId: string;
    initiative: number;
}

interface InitiativeRow {
    combatant: Combatant;
    initiative: number;
}

@Component({
    selector: 'app-initiative-modal',
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        TranslatePipe,
        ModalFocusTrapDirective,
        MODAL_ANIMATION_DIRECTIVES,
    ],
    templateUrl: './initiative-modal.html',
    styleUrl: './initiative-modal.scss',
})
export class InitiativeModal implements OnChanges {
    @Input({ required: true }) combatants: Combatant[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<InitiativeUpdate[]>();

    rows: InitiativeRow[] = [];

    protected readonly CheckIcon = CheckIcon;
    protected readonly XIcon = XIcon;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['combatants']) {
            this.rows = this.combatants.map((combatant) => ({
                combatant,
                initiative: combatant.initiative,
            }));
        }
    }

    submit() {
        this.save.emit(
            this.rows.map((row) => ({
                combatantId: row.combatant.id,
                initiative: Math.floor(Number(row.initiative)) || 0,
            })),
        );
        this.close.emit();
    }

    selectNumberValue(event: FocusEvent | MouseEvent) {
        const input = event.target as HTMLInputElement;

        input.select();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.close.emit();
        }
    }
}

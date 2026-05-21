import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckIcon, LucideAngularModule, XIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Combatant } from '../../core/entities/combatant';
import { MODAL_ANIMATION_DIRECTIVES } from '../../shared/modal-animation.directive';
import { ModalFocusTrapDirective } from '../../shared/modal-focus-trap.directive';

export interface CombatantAdminUpdate {
    name: string;
    armorClass: number;
    currentHp: number;
    maxHp: number;
    initiative: number;
}

@Component({
    selector: 'app-combatant-edit-modal',
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        TranslatePipe,
        ModalFocusTrapDirective,
        MODAL_ANIMATION_DIRECTIVES
    ],
    templateUrl: './combatant-edit-modal.html',
    styleUrl: './combatant-edit-modal.scss'
})
export class CombatantEditModal implements OnChanges {
    @Input({ required: true }) combatant!: Combatant;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<CombatantAdminUpdate>();

    model: CombatantAdminUpdate = {
        name: '',
        armorClass: 10,
        currentHp: 1,
        maxHp: 1,
        initiative: 0
    };

    protected readonly CheckIcon = CheckIcon;
    protected readonly XIcon = XIcon;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['combatant'] && this.combatant) {
            this.model = {
                name: this.combatant.name,
                armorClass: this.combatant.armorClass,
                currentHp: this.combatant.currentHp,
                maxHp: this.combatant.maxHp,
                initiative: this.combatant.initiative
            };
        }
    }

    get canSave(): boolean {
        return !!this.model.name.trim()
            && this.model.armorClass > 0
            && this.model.maxHp > 0
            && this.model.currentHp >= 0;
    }

    submit() {
        if (!this.canSave) return;

        const maxHp = Math.max(1, Math.floor(Number(this.model.maxHp)) || 1);

        this.save.emit({
            name: this.model.name.trim(),
            armorClass: Math.max(1, Math.floor(Number(this.model.armorClass)) || 10),
            currentHp: Math.max(0, Math.min(Math.floor(Number(this.model.currentHp)) || 0, maxHp)),
            maxHp,
            initiative: Math.floor(Number(this.model.initiative)) || 0
        });
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

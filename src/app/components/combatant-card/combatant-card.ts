import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Combatant } from '../../core/entities/combatant';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-combatant-card',
    imports: [],
    templateUrl: './combatant-card.html',
    styleUrl: './combatant-card.scss',
    animations: [
        trigger('cardAnim', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate('200ms ease-out',
                    style({ opacity: 1, transform: 'scale(1)' })
                )
            ]),
            transition(':leave', [
                animate('150ms ease-in',
                    style({ opacity: 0, transform: 'scale(0.8)' })
                )
            ])
        ])
    ]
})
export class CombatantCard {

    @Input() combatant!: Combatant;
    @Output() damage = new EventEmitter<number>();
    @Output() healing = new EventEmitter<number>();
    @Output() remove = new EventEmitter<void>();
    @Output() initiativeChange = new EventEmitter<number>();

    applyDamage(value: string) {
        const dmg = Number(value);
        if (isNaN(dmg) || dmg <= 0) return;

        this.damage.emit(dmg);
    }

    applyHealing(value: string) {
        const heal = Number(value);
        if (isNaN(heal) || heal <= 0) return;

        this.healing.emit(heal);
    }

    updateInitiative(value: string) {
        const init = Number(value);
        if (isNaN(init)) return;

        this.combatant.initiative = init;
        this.initiativeChange.emit(init);
    }

}

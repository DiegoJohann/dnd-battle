import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Enemy } from '../../core/entities/enemy';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-enemy-card',
    imports: [],
    templateUrl: './enemy-card.html',
    styleUrl: './enemy-card.scss',
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
export class EnemyCard {

    @Input() enemy!: Enemy;
    @Output() damage = new EventEmitter<number>();
    @Output() remove = new EventEmitter<void>();
    @Output() initiativeChange = new EventEmitter<number>();

    applyDamage(value: string) {
        const dmg = Number(value);
        if (isNaN(dmg) || dmg <= 0) return;

        this.damage.emit(dmg);
    }

    updateInitiative(value: string) {
        const init = Number(value);
        if (isNaN(init)) return;

        this.enemy.initiative = init;
        this.initiativeChange.emit(init);
    }

}

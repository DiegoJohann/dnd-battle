import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Enemy } from '../../core/entities/enemy';

@Component({
    selector: 'app-enemy-card',
    imports: [],
    templateUrl: './enemy-card.html',
    styleUrl: './enemy-card.scss',
})
export class EnemyCard {

    @Input() enemy!: Enemy;
    @Output() damage = new EventEmitter<number>();
    @Output() remove = new EventEmitter<void>();

    applyDamage(value: string) {
        const dmg = Number(value);
        if (isNaN(dmg) || dmg <= 0) return;

        this.damage.emit(dmg);
    }

}

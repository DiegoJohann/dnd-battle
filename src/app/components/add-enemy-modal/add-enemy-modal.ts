import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Enemy } from '../../core/entities/enemy';

@Component({
    selector: 'app-add-enemy-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './add-enemy-modal.html',
    styleUrl: './add-enemy-modal.scss',
})
export class AddEnemyModal {
    @Output() close = new EventEmitter<void>();
    @Output() create = new EventEmitter<Enemy>();

    name = '';
    hp = 0;
    ac = 0;

    submit() {
        if (!this.name || this.hp <= 0 || this.ac <= 0) return;

        this.create.emit({
            id: crypto.randomUUID(),
            name: this.name,
            maxHp: this.hp,
            currentHp: this.hp,
            armorClass: this.ac,
            alive: true
        });

        this.close.emit();
    }
}

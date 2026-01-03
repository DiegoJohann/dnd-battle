import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enemy } from '../../core/entities/enemy';
import { AddEnemyModal } from '../add-enemy-modal/add-enemy-modal';
import { EnemyCard } from '../enemy-card/enemy-card';

@Component({
    selector: 'app-battle',
    imports: [CommonModule, AddEnemyModal, EnemyCard],
    templateUrl: './battle.html',
    styleUrl: './battle.scss',
})
export class Battle implements OnInit {

    enemies: Enemy[] = [];
    showModal = false;

    openAddEnemyModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    addEnemy(enemy: Enemy) {
        this.enemies.push(enemy);
        this.save();
    }

    applyDamage(enemy: Enemy, damage: number) {
        if (!enemy.alive) return;

        enemy.currentHp = Math.max(enemy.currentHp - damage, 0);
        enemy.alive = enemy.currentHp > 0;
        this.save();
    }

    save() {
        localStorage.setItem('battle', JSON.stringify(this.enemies));
    }

    load() {
        const saved = localStorage.getItem('battle');
        if (saved) this.enemies = JSON.parse(saved);
    }

    removeEnemy(enemy: Enemy) {
        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
        this.save();
    }

    ngOnInit() {
        this.load();
    }
}

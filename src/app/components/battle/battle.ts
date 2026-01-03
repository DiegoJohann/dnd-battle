import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enemy } from '../../core/entities/enemy';
import { AddEnemyModal } from '../add-enemy-modal/add-enemy-modal';
import { EnemyCard } from '../enemy-card/enemy-card';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-battle',
    imports: [CommonModule, AddEnemyModal, EnemyCard],
    templateUrl: './battle.html',
    styleUrl: './battle.scss',
    animations: [
        trigger('listAnim', [
            transition('* <=> *', [
                query(
                    ':enter, :leave',
                    style({opacity: 0}),
                    {optional: true}
                ),
                query(
                    ':enter',
                    stagger(50, [
                        animate('200ms ease-out',
                            style({opacity: 1})
                        )
                    ]),
                    {optional: true}
                )
            ])
        ])
    ]
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
        this.enemies.push({
            ...enemy,
            initiative: enemy.initiative ?? 0
        });

        this.sortByInitiative();
        this.save();
    }

    updateInitiative(enemy: Enemy, initiative: number) {
        enemy.initiative = initiative;
        this.sortByInitiative();
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
        if (!saved) return;

        this.enemies = JSON.parse(saved).map((e: Enemy) => ({
            ...e,
            initiative: e.initiative ?? 0
        }));

        this.sortByInitiative();
    }

    removeEnemy(enemy: Enemy) {
        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
        this.save();
    }

    ngOnInit() {
        this.load();
    }

    private sortByInitiative() {
        this.enemies.sort((a, b) => b.initiative - a.initiative);
    }
}

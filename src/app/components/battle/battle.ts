import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combatant } from '../../core/entities/combatant';
import { AddCombatantModal } from '../add-combatant-modal/add-combatant-modal';
import { CombatantCard } from '../combatant-card/combatant-card';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { LucideAngularModule, PlusIcon, Trash2Icon } from 'lucide-angular';
import { ConfirmationDialog } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
    selector: 'app-battle',
    imports: [CommonModule, AddCombatantModal, CombatantCard, LucideAngularModule, ConfirmationDialog],
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

    combatants: Combatant[] = [];
    showAddCombatantModal = false;
    showClearFieldModal = false;

    showConfirmationDialog = false;
    combatantToRemove: Combatant | undefined;

    openAddCombatantModal() {
        this.showAddCombatantModal = true;
    }

    closeAddCombatantModal() {
        this.showAddCombatantModal = false;
    }

    addCombatant(combatant: Combatant) {
        this.combatants.push({
            ...combatant,
            initiative: combatant.initiative ?? 0
        });

        this.sortByInitiative();
        this.save();
    }

    updateInitiative(combatant: Combatant, initiative: number) {
        combatant.initiative = initiative;
        this.sortByInitiative();
        this.save();
    }

    applyDamage(combatant: Combatant, damage: number) {
        if (!combatant.alive) return;

        combatant.currentHp = Math.max(combatant.currentHp - damage, 0);
        combatant.alive = combatant.currentHp > 0;
        this.save();
    }

    applyHealing(combatant: Combatant, healing: number) {
        combatant.currentHp = Math.min(combatant.currentHp + healing, combatant.maxHp);
        combatant.alive = combatant.currentHp > 0;
        this.save();
    }

    onClickRemoveCombatant(combatant: Combatant) {
        this.combatantToRemove = combatant;
        this.showConfirmationDialog = true;
    }

    removeCombatant() {
        this.combatants = this.combatants.filter(e => e.id !== this.combatantToRemove?.id);
        this.save();
        this.showConfirmationDialog = false;
        this.combatantToRemove = undefined;
    }

    openClearFieldModal() {
        this.showClearFieldModal = true;
    }

    closeClearFieldModal() {
        this.showClearFieldModal = false;
    }

    clearCombatants(type: 'NPC' | 'PLAYER' | 'ALL') {
        if (type === 'ALL') {
            this.combatants = [];
        } else {
            this.combatants = this.combatants.filter(c => c.type !== type);
        }
        this.save();
        this.closeClearFieldModal();
    }

    save() {
        localStorage.setItem('battle', JSON.stringify(this.combatants));
    }

    load() {
        const saved = localStorage.getItem('battle');
        if (!saved) return;

        this.combatants = JSON.parse(saved).map((e: Combatant) => ({
            ...e,
            initiative: e.initiative ?? 0
        }));

        this.sortByInitiative();
    }

    ngOnInit() {
        this.load();
    }

    private sortByInitiative() {
        this.combatants.sort((a, b) => b.initiative - a.initiative);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeydown(event: Event) {
        const keyboardEvent = event as KeyboardEvent;

        if (keyboardEvent.key === 'Escape') {
            keyboardEvent.preventDefault();
            this.closeClearFieldModal();
        }

        if (keyboardEvent.key.toLowerCase() !== 'a') return;

        if ((keyboardEvent.target as HTMLElement).tagName === 'INPUT') return;

        keyboardEvent.preventDefault();
        this.openAddCombatantModal();
    }

    protected readonly PlusIcon = PlusIcon;
    protected readonly Trash2Icon = Trash2Icon;
}

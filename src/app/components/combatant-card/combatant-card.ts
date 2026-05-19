import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import {
    Combatant,
    COMBATANT_CONDITION_CATALOG,
    CombatantConditionDefinition,
    CombatantConditionKey
} from '../../core/entities/combatant';
import { animate, style, transition, trigger } from '@angular/animations';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-combatant-card',
    imports: [
        NgStyle
    ],
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
    @Input() conditionsOpen = false;

    @Output() toggleConditions = new EventEmitter<void>();
    @Output() closeConditions = new EventEmitter<void>();

    @Output() damage = new EventEmitter<number>();
    @Output() healing = new EventEmitter<number>();
    @Output() temporaryHpChange = new EventEmitter<number>();
    @Output() remove = new EventEmitter<void>();
    @Output() initiativeChange = new EventEmitter<number>();
    @Output() conditionsChange = new EventEmitter<CombatantConditionKey[]>();

    readonly conditionCatalog = COMBATANT_CONDITION_CATALOG;

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

    applyTemporaryHp(value: string) {
        const temp = Number(value);
        if (isNaN(temp) || temp <= 0) return;
        this.temporaryHpChange.emit(temp);
    }

    updateInitiative(value: string) {
        const init = Number(value);
        if (isNaN(init)) return;

        this.combatant.initiative = init;
        this.initiativeChange.emit(init);
    }

    get healthPercent(): number {
        const maxHp = this.combatant.maxHp || 1;
        return Math.max(0, Math.min((this.combatant.currentHp / maxHp) * 100, 100));
    }

    get temporaryHp(): number {
        return this.combatant.temporaryHp ?? 0;
    }

    get tempHpPercent(): number {
        const maxHp = this.combatant.maxHp || 1;
        return Math.max(0, Math.min((this.temporaryHp / maxHp) * 100, 100));
    }

    get tempHpVisiblePercent(): number {
        return Math.max(0, Math.min(this.tempHpPercent, 100 - this.healthPercent));
    }

    get activeConditions(): CombatantConditionDefinition[] {
        const current = this.combatant.conditions ?? [];
        return this.conditionCatalog.filter(condition => current.includes(condition.key));
    }

    isConditionActive(key: CombatantConditionKey): boolean {
        return (this.combatant.conditions ?? []).includes(key);
    }

    toggleCondition(key: CombatantConditionKey) {
        const current = new Set(this.combatant.conditions ?? []);

        if (current.has(key)) {
            current.delete(key);
        } else {
            current.add(key);
        }

        const next = this.conditionCatalog
            .map(condition => condition.key)
            .filter(conditionKey => current.has(conditionKey));

        this.combatant.conditions = next;
        this.conditionsChange.emit(next);

        this.closeConditions.emit();
    }

    clearConditions() {
        this.combatant.conditions = [];
        this.conditionsChange.emit([]);

        this.closeConditions.emit();
    }

    @HostListener('document:click')
    onOutsideClick() {
        if (this.conditionsOpen) {
            this.closeConditions.emit();
        }
    }

    onToggleClick(event: MouseEvent) {
        event.stopPropagation();
        this.toggleConditions.emit();
    }

    getConditionStyle(condition: CombatantConditionDefinition) {
        const isActive = this.isConditionActive(condition.key);

        return {
            background: isActive
                ? `${condition.color}55`
                : `${condition.color}22`,
            border: `1px solid ${condition.color}66`,
            color: '#fff'
        };
    }
}

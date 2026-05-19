import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combatant } from '../../core/entities/combatant';
import { AddCombatantModal } from '../add-combatant-modal/add-combatant-modal';
import { CombatantCard } from '../combatant-card/combatant-card';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { LucideAngularModule, PlusIcon, Trash2Icon } from 'lucide-angular';
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from 'lucide-angular';
import { ConfirmationDialog } from '../../shared/confirmation-dialog/confirmation-dialog';
import { SpellSlotsModal } from '../spell-slots-modal/spell-slots-modal';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/i18n/language.service';
import { SupportedLanguage } from '../../core/i18n/i18n';

@Component({
    selector: 'app-battle',
    imports: [
        CommonModule,
        AddCombatantModal,
        CombatantCard,
        LucideAngularModule,
        ConfirmationDialog,
        SpellSlotsModal,
        TranslatePipe
    ],
    templateUrl: './battle.html',
    styleUrl: './battle.scss',
    animations: [
        trigger('listAnim', [
            transition('* <=> *', [
                query(':enter, :leave', style({ opacity: 0 }), { optional: true }),
                query(':enter', stagger(50, [
                    animate('200ms ease-out', style({ opacity: 1 }))
                ]), { optional: true })
            ])
        ])
    ]
})
export class Battle implements OnInit {

    combatants: Combatant[] = [];
    round = 1;
    activeCombatantId: string | null = null;

    openConditionsForId: string | null = null;

    showAddCombatantModal = false;
    showClearFieldModal = false;
    showResetTurnModal = false;

    showConfirmationDialog = false;
    combatantToRemove: Combatant | undefined;
    spellSlotsCombatant: Combatant | undefined;

    constructor(protected languageService: LanguageService) {
    }

    changeLanguage(value: string) {
        this.languageService.use(value as SupportedLanguage);
    }

    openAddCombatantModal() {
        this.showAddCombatantModal = true;
    }

    closeAddCombatantModal() {
        this.showAddCombatantModal = false;
    }

    addCombatant(combatant: Combatant) {
        this.combatants.push({
            ...combatant,
            initiative: combatant.initiative ?? 0,
            temporaryHp: combatant.temporaryHp ?? 0
        });

        this.sortByInitiative();
        this.ensureActiveCombatant();
        this.save();
        this.saveTurnState();
    }

    updateInitiative(combatant: Combatant, initiative: number) {
        combatant.initiative = initiative;
        this.sortByInitiative();
        this.save();
    }

    updateTemporaryHp(combatant: Combatant, temporaryHp: number) {
        if (isNaN(temporaryHp) || temporaryHp < 0) return;

        if (temporaryHp === 0) {
            combatant.temporaryHp = 0;
            this.save();
            return;
        }

        combatant.temporaryHp = Math.max(combatant.temporaryHp ?? 0, temporaryHp);
        this.save();
    }

    applyDamage(combatant: Combatant, damage: number) {
        if (!combatant.alive) return;

        let remainingDamage = damage;

        if ((combatant.temporaryHp ?? 0) > 0) {
            const tempUsed = Math.min(combatant.temporaryHp ?? 0, remainingDamage);
            combatant.temporaryHp = Math.max((combatant.temporaryHp ?? 0) - tempUsed, 0);
            remainingDamage -= tempUsed;
        }

        if (remainingDamage > 0) {
            combatant.currentHp = Math.max(combatant.currentHp - remainingDamage, 0);
        }

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
        const removedId = this.combatantToRemove?.id;
        const removedIndex = this.combatants.findIndex(e => e.id === removedId);

        this.combatants = this.combatants.filter(e => e.id !== this.combatantToRemove?.id);

        if (this.activeCombatantId === removedId) {
            this.activeCombatantId = this.combatants.length
                ? this.combatants[Math.min(Math.max(removedIndex, 0), this.combatants.length - 1)].id
                : null;
        }

        this.save();
        this.saveTurnState();
        this.showConfirmationDialog = false;
        this.combatantToRemove = undefined;
    }

    toggleConditionsPopover(id: string) {
        this.openConditionsForId = this.openConditionsForId === id ? null : id;
    }

    closeAllConditions() {
        this.openConditionsForId = null;
    }

    openSpellSlotsModal(combatant: Combatant) {
        this.spellSlotsCombatant = combatant;
        this.closeAllConditions();
    }

    closeSpellSlotsModal() {
        this.spellSlotsCombatant = undefined;
    }

    openClearFieldModal() {
        this.showClearFieldModal = true;
    }

    closeClearFieldModal() {
        this.showClearFieldModal = false;
    }

    clearCombatants(type: 'NPC' | 'PLAYER' | 'ALL') {
        const activeBeforeClear = this.activeCombatantId;

        if (type === 'ALL') {
            this.combatants = [];
        } else {
            this.combatants = this.combatants.filter(c => c.type !== type);
        }

        if (!this.combatants.some(combatant => combatant.id === activeBeforeClear)) {
            this.activeCombatantId = this.combatants[0]?.id ?? null;
        }

        if (!this.combatants.length) {
            this.round = 1;
        }

        this.save();
        this.saveTurnState();
        this.closeClearFieldModal();
    }

    save() {
        localStorage.setItem('battle', JSON.stringify(this.combatants));
    }

    saveTurnState() {
        localStorage.setItem('battle-turn', JSON.stringify({
            round: this.round,
            activeCombatantId: this.activeCombatantId
        }));
    }

    load() {
        const saved = localStorage.getItem('battle');
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved) as Partial<Combatant>[];

            this.combatants = parsed.map((e) => ({
                ...e,
                initiative: e.initiative ?? 0,
                temporaryHp: e.temporaryHp ?? 0,
                alive: typeof e.alive === 'boolean' ? e.alive : (e.currentHp ?? 0) > 0,
                conditions: Array.isArray(e.conditions) ? e.conditions : [],
                spellSlots: Array.isArray(e.spellSlots)
                    ? e.spellSlots
                        .map(slot => {
                            const level = Math.floor(Number(slot.level));
                            const total = Math.max(0, Math.floor(Number(slot.total)));
                            const remaining = Math.max(
                                0,
                                Math.min(Math.floor(Number(slot.remaining)), total)
                            );

                            return { level, total, remaining };
                        })
                        .filter(slot => slot.level >= 1 && slot.level <= 9)
                    : []
            })) as Combatant[];

            this.sortByInitiative();
            this.loadTurnState();
            this.ensureActiveCombatant();
        } catch {
            localStorage.removeItem('battle');
            localStorage.removeItem('battle-turn');
            this.combatants = [];
            this.round = 1;
            this.activeCombatantId = null;
        }
    }

    ngOnInit() {
        this.load();
        this.ensureActiveCombatant();
    }

    nextTurn() {
        if (!this.combatants.length) return;

        const nextIndex = this.activeCombatantIndex + 1;

        if (nextIndex >= this.combatants.length) {
            this.round += 1;
            this.activeCombatantId = this.combatants[0].id;
        } else {
            this.activeCombatantId = this.combatants[nextIndex].id;
        }

        this.saveTurnState();
    }

    previousTurn() {
        if (!this.combatants.length) return;

        if (this.activeCombatantIndex <= 0) {
            this.round = Math.max(1, this.round - 1);
            this.activeCombatantId = this.combatants[this.combatants.length - 1].id;
        } else {
            this.activeCombatantId = this.combatants[this.activeCombatantIndex - 1].id;
        }

        this.saveTurnState();
    }

    resetTurnTracker() {
        this.round = 1;
        this.activeCombatantId = this.combatants[0]?.id ?? null;
        this.saveTurnState();
        this.closeResetTurnModal();
    }

    openResetTurnModal() {
        if (!this.combatants.length) return;

        this.showResetTurnModal = true;
    }

    closeResetTurnModal() {
        this.showResetTurnModal = false;
    }

    setActiveCombatant(combatant: Combatant) {
        this.activeCombatantId = combatant.id;
        this.saveTurnState();
    }

    get activeCombatant(): Combatant | undefined {
        return this.combatants.find(combatant => combatant.id === this.activeCombatantId)
            ?? this.combatants[0];
    }

    get activeCombatantIndex(): number {
        const index = this.combatants.findIndex(combatant => combatant.id === this.activeCombatantId);

        return index >= 0 ? index : 0;
    }

    private sortByInitiative() {
        this.combatants.sort((a, b) => b.initiative - a.initiative);
    }

    private loadTurnState() {
        const saved = localStorage.getItem('battle-turn');
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved) as {
                round?: number;
                activeCombatantId?: string | null;
            };

            this.round = Math.max(1, Math.floor(Number(parsed.round)) || 1);
            this.activeCombatantId = typeof parsed.activeCombatantId === 'string'
                ? parsed.activeCombatantId
                : null;
        } catch {
            localStorage.removeItem('battle-turn');
        }
    }

    private ensureActiveCombatant() {
        if (!this.combatants.length) {
            this.activeCombatantId = null;
            this.round = 1;
            return;
        }

        if (!this.combatants.some(combatant => combatant.id === this.activeCombatantId)) {
            this.activeCombatantId = this.combatants[0].id;
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeydown(event: Event) {
        const keyboardEvent = event as KeyboardEvent;

        if (keyboardEvent.key === 'Escape') {
            keyboardEvent.preventDefault();
            this.closeClearFieldModal();
            this.closeResetTurnModal();
            this.closeAllConditions();
            this.closeSpellSlotsModal();
        }

        if ((keyboardEvent.target as HTMLElement).tagName === 'INPUT') return;
        if ((keyboardEvent.target as HTMLElement).tagName === 'SELECT') return;

        if (keyboardEvent.key === 'ArrowRight') {
            keyboardEvent.preventDefault();
            this.nextTurn();
            return;
        }

        if (keyboardEvent.key === 'ArrowLeft') {
            keyboardEvent.preventDefault();
            this.previousTurn();
            return;
        }

        if (keyboardEvent.key.toLowerCase() !== 'a') return;

        keyboardEvent.preventDefault();
        this.openAddCombatantModal();
    }

    protected readonly ChevronLeftIcon = ChevronLeftIcon;
    protected readonly ChevronRightIcon = ChevronRightIcon;
    protected readonly PlusIcon = PlusIcon;
    protected readonly RotateCcwIcon = RotateCcwIcon;
    protected readonly Trash2Icon = Trash2Icon;
}

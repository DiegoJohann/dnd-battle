import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combatant, CombatantConditionKey, CombatantConditionState } from '../../core/entities/combatant';
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
import { HotkeysService } from '../../core/hotkeys/hotkeys.service';

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

    @ViewChild('clearCancelButton') set clearCancelButton(button: ElementRef<HTMLButtonElement> | undefined) {
        this.focusDefaultModalAction(button);
    }

    @ViewChild('resetCancelButton') set resetCancelButton(button: ElementRef<HTMLButtonElement> | undefined) {
        this.focusDefaultModalAction(button);
    }

    constructor(
        protected languageService: LanguageService,
        private hotkeysService: HotkeysService
    ) {
    }

    changeLanguage(value: string) {
        this.languageService.use(value as SupportedLanguage);
    }

    openAddCombatantModal() {
        this.closeAllConditions();
        this.showAddCombatantModal = true;
    }

    closeAddCombatantModal() {
        this.showAddCombatantModal = false;
    }

    addCombatant(combatant: Combatant) {
        this.combatants.push({
            ...combatant,
            initiative: combatant.initiative ?? 0,
            temporaryHp: combatant.temporaryHp ?? 0,
            conditionStates: combatant.conditionStates ?? []
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
        this.closeAllConditions();
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
                conditionStates: this.normalizeConditionStates(e),
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

        this.closeAllConditions();

        const nextIndex = this.activeCombatantIndex + 1;
        const wrappedRound = nextIndex >= this.combatants.length;

        if (wrappedRound) {
            this.round += 1;
            this.activeCombatantId = this.combatants[0].id;
        } else {
            this.activeCombatantId = this.combatants[nextIndex].id;
        }

        this.tickStartOfTurnConditions(this.activeCombatantId);
        this.save();
        this.saveTurnState();
    }

    previousTurn() {
        if (!this.combatants.length) return;

        this.closeAllConditions();

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

        this.closeAllConditions();
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

    private normalizeConditionStates(combatant: Partial<Combatant>): CombatantConditionState[] {
        const activeConditions = Array.isArray(combatant.conditions)
            ? combatant.conditions
            : [];
        const activeKeys = new Set(activeConditions);
        const currentStates = Array.isArray(combatant.conditionStates)
            ? combatant.conditionStates
            : [];

        return activeConditions.map(key => {
            const state = currentStates.find(currentState => currentState.key === key);
            const durationMode = String(state?.durationMode ?? 'INDEFINITE');

            if (!state) {
                return {
                    key,
                    durationMode: 'INDEFINITE' as const
                };
            }

            if (durationMode === 'ROUNDS') {
                return {
                    key,
                    durationMode: 'ROUNDS' as const,
                    remainingRounds: Math.max(1, Math.floor(Number(state.remainingRounds)) || 1)
                };
            }

            if (durationMode === 'TURN_START' || durationMode === 'TURN_END') {
                return {
                    key,
                    durationMode: 'TURN_START' as const,
                    expiresOnCombatantId: state.expiresOnCombatantId ?? combatant.id
                };
            }

            return {
                key,
                durationMode: 'INDEFINITE' as const
            };
        }).filter(state => activeKeys.has(state.key));
    }

    private tickStartOfTurnConditions(combatantId: string | null) {
        if (!combatantId) return;

        this.combatants.forEach(combatant => {
            const expiringKeys = new Set<CombatantConditionKey>();

            combatant.conditionStates = (combatant.conditionStates ?? []).map(state => {
                const expiresOnCombatantId = state.expiresOnCombatantId ?? combatant.id;

                if (expiresOnCombatantId !== combatantId) return state;

                if (state.durationMode === 'TURN_START') {
                    expiringKeys.add(state.key);
                    return state;
                }

                if (state.durationMode === 'ROUNDS') {
                    const remainingRounds = Math.max(0, (state.remainingRounds ?? 1) - 1);

                    if (remainingRounds <= 0) {
                        expiringKeys.add(state.key);
                    }

                    return {
                        ...state,
                        remainingRounds
                    };
                }

                return state;
            });

            if (!expiringKeys.size) return;

            this.removeConditions(combatant, expiringKeys);
        });
    }

    private removeConditions(combatant: Combatant, keys: Set<CombatantConditionKey>) {
        combatant.conditions = (combatant.conditions ?? []).filter(key => !keys.has(key));
        combatant.conditionStates = (combatant.conditionStates ?? []).filter(state => !keys.has(state.key));
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

    private get hasBlockingModal(): boolean {
        return this.showAddCombatantModal
            || this.showClearFieldModal
            || this.showResetTurnModal
            || this.showConfirmationDialog
            || !!this.spellSlotsCombatant;
    }

    private closeOverlays() {
        this.closeAddCombatantModal();
        this.closeClearFieldModal();
        this.closeResetTurnModal();
        this.closeAllConditions();
        this.closeSpellSlotsModal();
        this.showConfirmationDialog = false;
        this.combatantToRemove = undefined;
    }

    trapModalTab(event: Event, modal: HTMLElement) {
        const keyboardEvent = event as KeyboardEvent;
        const focusableElements = Array.from(
            modal.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter(element => !element.hasAttribute('disabled') && element.offsetParent !== null);

        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (keyboardEvent.shiftKey && activeElement === firstElement) {
            keyboardEvent.preventDefault();
            lastElement.focus();
            return;
        }

        if (!keyboardEvent.shiftKey && activeElement === lastElement) {
            keyboardEvent.preventDefault();
            firstElement.focus();
        }
    }

    private focusDefaultModalAction(button: ElementRef<HTMLButtonElement> | undefined) {
        if (!button) return;

        setTimeout(() => button.nativeElement.focus());
    }

    @HostListener('window:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        const match = this.hotkeysService.matchBattleHotkey(event);

        if (!match) return;

        if (match.preventDefault) {
            event.preventDefault();
        }

        if (match.action === 'CLOSE_OVERLAYS') {
            this.closeOverlays();
            return;
        }

        if (this.hasBlockingModal) return;

        switch (match.action) {
            case 'ADD_COMBATANT':
                this.openAddCombatantModal();
                break;
            case 'CLEAR_BATTLEFIELD':
                this.openClearFieldModal();
                break;
            case 'NEXT_TURN':
                this.nextTurn();
                break;
            case 'PREVIOUS_TURN':
                this.previousTurn();
                break;
            case 'RESET_TURN':
                this.openResetTurnModal();
                break;
        }
    }

    protected readonly ChevronLeftIcon = ChevronLeftIcon;
    protected readonly ChevronRightIcon = ChevronRightIcon;
    protected readonly PlusIcon = PlusIcon;
    protected readonly RotateCcwIcon = RotateCcwIcon;
    protected readonly Trash2Icon = Trash2Icon;
}

import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    Combatant,
    CombatantConditionKey,
    CombatantConditionState,
    CombatantSpellSlotLevel,
} from '../../core/entities/combatant';
import { AddCombatantModal } from '../add-combatant-modal/add-combatant-modal';
import { CombatantCard } from '../combatant-card/combatant-card';
import { ConfirmationDialog } from '../../shared/confirmation-dialog/confirmation-dialog';
import { SpellSlotsModal } from '../spell-slots-modal/spell-slots-modal';
import { EncounterManagerModal } from '../encounter-manager-modal/encounter-manager-modal';
import { LibraryManagerModal } from '../library-manager-modal/library-manager-modal';
import { LanguageService } from '../../core/i18n/language.service';
import { SupportedLanguage } from '../../core/i18n/i18n';
import { HotkeysService } from '../../core/hotkeys/hotkeys.service';
import { BattleStorageService } from '../../core/battle/battle-storage.service';
import { EncounterData } from '../../core/encounters/encounter-serializer.service';
import { CombatantNormalizer } from '../../core/combatants/combatant-normalizer.service';
import { TurnTrackerComponent } from '../turn-tracker/turn-tracker';
import { BattleToolbarComponent } from '../battle-toolbar/battle-toolbar';
import { ClearBattleModal, ClearBattleType } from '../clear-battle-modal/clear-battle-modal';
import { ResetTurnModal } from '../reset-turn-modal/reset-turn-modal';
import { AreaDamageModal, AreaDamageResult } from '../area-damage-modal/area-damage-modal';
import { InitiativeModal, InitiativeUpdate } from '../initiative-modal/initiative-modal';
import {
    CombatantAdminUpdate,
    CombatantEditModal,
} from '../combatant-edit-modal/combatant-edit-modal';
import { CombatantPreset } from '../../core/entities/combatant-preset';

@Component({
    selector: 'app-battle',
    imports: [
        CommonModule,
        AddCombatantModal,
        CombatantCard,
        ConfirmationDialog,
        SpellSlotsModal,
        EncounterManagerModal,
        LibraryManagerModal,
        TurnTrackerComponent,
        BattleToolbarComponent,
        ClearBattleModal,
        ResetTurnModal,
        AreaDamageModal,
        InitiativeModal,
        CombatantEditModal,
    ],
    templateUrl: './battle.html',
    styleUrl: './battle.scss',
})
export class Battle implements OnInit {
    combatants: Combatant[] = [];
    round = 1;
    activeCombatantId: string | null = null;

    openConditionsForId: string | null = null;

    showAddCombatantModal = false;
    showClearFieldModal = false;
    showResetTurnModal = false;
    showEncounterModal = false;
    showLibraryModal = false;
    showAreaDamageModal = false;
    showInitiativeModal = false;

    showConfirmationDialog = false;
    combatantToRemove: Combatant | undefined;
    combatantToEdit: Combatant | undefined;
    spellSlotsCombatant: Combatant | undefined;
    combatantToSaveAsPreset: Combatant | undefined;

    constructor(
        protected languageService: LanguageService,
        private hotkeysService: HotkeysService,
        private battleStorage: BattleStorageService,
        private combatantNormalizer: CombatantNormalizer,
    ) {}

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

    openEncounterModal() {
        this.closeAllConditions();
        this.showEncounterModal = true;
    }

    closeEncounterModal() {
        this.showEncounterModal = false;
    }

    openLibraryModal() {
        this.closeAllConditions();
        this.combatantToSaveAsPreset = undefined;
        this.showLibraryModal = true;
    }

    openLibraryModalWithCombatant(combatant: Combatant) {
        this.closeAllConditions();
        this.combatantToSaveAsPreset = combatant;
        this.showLibraryModal = true;
    }

    closeLibraryModal() {
        this.showLibraryModal = false;
        this.combatantToSaveAsPreset = undefined;
    }

    loadPresetsToBattle(
        loadRequests: { presets: CombatantPreset[]; quantity: number; rollInitiative: boolean }[],
    ) {
        const newCombatants: Combatant[] = [];

        for (const request of loadRequests) {
            for (const preset of request.presets) {
                const count = Math.max(1, Math.min(50, request.quantity));
                const groupId = count > 1 ? crypto.randomUUID() : undefined;
                const baseName = preset.name || preset.presetName;

                for (let i = 0; i < count; i++) {
                    const initiative = request.rollInitiative
                        ? this.rollInitiative(preset.initiativeBonus)
                        : preset.initiativeBonus;

                    newCombatants.push({
                        id: crypto.randomUUID(),
                        groupId,
                        name: count > 1 ? `${baseName} ${i + 1}` : baseName,
                        type: preset.type,
                        armorClass: preset.armorClass,
                        maxHp: preset.maxHp,
                        currentHp: preset.maxHp,
                        initiative,
                        alive: true,
                    });
                }
            }
        }

        this.addCombatants(newCombatants);
    }

    addCombatants(combatants: Combatant[]) {
        this.combatants.push(
            ...combatants.map((combatant) =>
                this.combatantNormalizer.normalizeCombatant(combatant),
            ),
        );

        this.sortByInitiative();
        this.ensureActiveCombatant();
        this.save();
        this.saveTurnState();
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
        this.applyDamageToCombatant(combatant, damage);
        this.save();
    }

    applyAreaDamage(results: AreaDamageResult[]) {
        results.forEach((result) => {
            const combatant = this.combatants.find((current) => current.id === result.combatantId);

            if (!combatant || result.damage <= 0) return;

            this.applyDamageToCombatant(combatant, result.damage);
        });

        this.save();
        this.closeAreaDamageModal();
    }

    private applyDamageToCombatant(combatant: Combatant, damage: number) {
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
    }

    applyHealing(combatant: Combatant, healing: number) {
        combatant.currentHp = Math.min(combatant.currentHp + healing, combatant.maxHp);
        combatant.alive = combatant.currentHp > 0;
        this.save();
    }

    updateConditions(combatant: Combatant, conditions: CombatantConditionKey[]) {
        combatant.conditions = conditions;
        this.save();
    }

    updateConditionStates(combatant: Combatant, conditionStates: CombatantConditionState[]) {
        combatant.conditionStates = conditionStates;
        this.save();
    }

    updateSpellSlots(combatant: Combatant, spellSlots: CombatantSpellSlotLevel[]) {
        combatant.spellSlots = spellSlots;
        this.save();
    }

    onClickRemoveCombatant(combatant: Combatant) {
        this.combatantToRemove = combatant;
        this.showConfirmationDialog = true;
    }

    onClickEditCombatant(combatant: Combatant) {
        this.closeAllConditions();
        this.combatantToEdit = combatant;
    }

    removeCombatant() {
        const removedId = this.combatantToRemove?.id;
        const removedIndex = this.combatants.findIndex((e) => e.id === removedId);

        this.combatants = this.combatants.filter((e) => e.id !== this.combatantToRemove?.id);

        if (this.activeCombatantId === removedId) {
            this.activeCombatantId = this.combatants.length
                ? this.combatants[Math.min(Math.max(removedIndex, 0), this.combatants.length - 1)]
                      .id
                : null;
        }

        this.save();
        this.saveTurnState();
        this.showConfirmationDialog = false;
        this.combatantToRemove = undefined;
    }

    updateCombatantAdmin(combatant: Combatant, update: CombatantAdminUpdate) {
        const activeBeforeUpdate = this.activeCombatantId;

        combatant.name = update.name;
        combatant.armorClass = update.armorClass;
        combatant.maxHp = update.maxHp;
        combatant.currentHp = update.currentHp;
        combatant.initiative = update.initiative;
        combatant.alive = combatant.currentHp > 0;

        this.sortByInitiative();
        this.activeCombatantId = this.combatants.some(
            (current) => current.id === activeBeforeUpdate,
        )
            ? activeBeforeUpdate
            : (this.combatants[0]?.id ?? null);
        this.save();
        this.saveTurnState();
        this.closeCombatantEditModal();
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

    openAreaDamageModal() {
        if (!this.hasAliveNpcs) return;

        this.closeAllConditions();
        this.showAreaDamageModal = true;
    }

    closeAreaDamageModal() {
        this.showAreaDamageModal = false;
    }

    openInitiativeModal() {
        if (!this.combatants.length) return;

        this.closeAllConditions();
        this.showInitiativeModal = true;
    }

    closeInitiativeModal() {
        this.showInitiativeModal = false;
    }

    applyInitiative(updates: InitiativeUpdate[]) {
        const initiativeById = new Map(
            updates.map((update) => [update.combatantId, update.initiative]),
        );

        this.combatants.forEach((combatant) => {
            const initiative = initiativeById.get(combatant.id);

            if (initiative === undefined) return;

            combatant.initiative = initiative;
        });

        this.sortByInitiative();
        this.round = 1;
        this.activeCombatantId = this.combatants[0]?.id ?? null;
        this.save();
        this.saveTurnState();
        this.closeInitiativeModal();
    }

    closeCombatantEditModal() {
        this.combatantToEdit = undefined;
    }

    clearCombatants(type: ClearBattleType) {
        const activeBeforeClear = this.activeCombatantId;

        if (type === 'ALL') {
            this.combatants = [];
        } else {
            this.combatants = this.combatants.filter((c) => c.type !== type);
        }

        if (!this.combatants.some((combatant) => combatant.id === activeBeforeClear)) {
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
        this.battleStorage.saveBattle(this.combatants);
    }

    saveTurnState() {
        this.battleStorage.saveTurn({
            round: this.round,
            activeCombatantId: this.activeCombatantId,
        });
    }

    load() {
        const combatants = this.battleStorage.loadBattle();
        if (!combatants) return;

        this.combatants = combatants;
        this.sortByInitiative();
        this.loadTurnState();
        this.ensureActiveCombatant();
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

    get activeCombatant(): Combatant | undefined {
        return (
            this.combatants.find((combatant) => combatant.id === this.activeCombatantId) ??
            this.combatants[0]
        );
    }

    get hasAliveNpcs(): boolean {
        return this.combatants.some((combatant) => combatant.type === 'NPC' && combatant.alive);
    }

    get activeCombatantIndex(): number {
        const index = this.combatants.findIndex(
            (combatant) => combatant.id === this.activeCombatantId,
        );

        return index >= 0 ? index : 0;
    }

    private sortByInitiative() {
        this.combatants.sort((a, b) => b.initiative - a.initiative);
    }

    private rollInitiative(modifier: number): number {
        return Math.floor(Math.random() * 20) + 1 + modifier;
    }

    private tickStartOfTurnConditions(combatantId: string | null) {
        if (!combatantId) return;

        this.combatants.forEach((combatant) => {
            const expiringKeys = new Set<CombatantConditionKey>();

            combatant.conditionStates = (combatant.conditionStates ?? []).map((state) => {
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
                        remainingRounds,
                    };
                }

                return state;
            });

            if (!expiringKeys.size) return;

            this.removeConditions(combatant, expiringKeys);
        });
    }

    private removeConditions(combatant: Combatant, keys: Set<CombatantConditionKey>) {
        combatant.conditions = (combatant.conditions ?? []).filter((key) => !keys.has(key));
        combatant.conditionStates = (combatant.conditionStates ?? []).filter(
            (state) => !keys.has(state.key),
        );
    }

    private loadTurnState() {
        const turn = this.battleStorage.loadTurn();
        if (!turn) return;

        this.round = turn.round;
        this.activeCombatantId = turn.activeCombatantId;
    }

    applyEncounterData(encounter: EncounterData) {
        this.combatants = this.combatantNormalizer.normalizeCombatants(encounter.combatants);
        this.round = Math.max(1, Math.floor(Number(encounter.turn.round)) || 1);
        this.activeCombatantId =
            typeof encounter.turn.activeCombatantId === 'string'
                ? encounter.turn.activeCombatantId
                : null;

        this.sortByInitiative();
        this.ensureActiveCombatant();
        this.save();
        this.saveTurnState();
        this.closeAllConditions();
    }

    private ensureActiveCombatant() {
        if (!this.combatants.length) {
            this.activeCombatantId = null;
            this.round = 1;
            return;
        }

        if (!this.combatants.some((combatant) => combatant.id === this.activeCombatantId)) {
            this.activeCombatantId = this.combatants[0].id;
        }
    }

    private get hasBlockingModal(): boolean {
        return (
            this.showAddCombatantModal ||
            this.showClearFieldModal ||
            this.showResetTurnModal ||
            this.showEncounterModal ||
            this.showLibraryModal ||
            this.showAreaDamageModal ||
            this.showInitiativeModal ||
            this.showConfirmationDialog ||
            !!this.combatantToEdit ||
            !!this.spellSlotsCombatant
        );
    }

    private closeOverlays() {
        this.closeAddCombatantModal();
        this.closeClearFieldModal();
        this.closeResetTurnModal();
        this.closeEncounterModal();
        this.closeLibraryModal();
        this.closeAreaDamageModal();
        this.closeInitiativeModal();
        this.closeCombatantEditModal();
        this.closeAllConditions();
        this.closeSpellSlotsModal();
        this.showConfirmationDialog = false;
        this.combatantToRemove = undefined;
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
            case 'OPEN_LIBRARY':
                this.openLibraryModal();
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
}

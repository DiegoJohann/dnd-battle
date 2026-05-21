import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import {
    Combatant,
    COMBATANT_CONDITION_CATALOG,
    CombatantConditionDefinition,
    CombatantConditionDurationMode,
    CombatantConditionKey,
    CombatantConditionState,
    CombatantSpellSlotLevel
} from '../../core/entities/combatant';
import { CheckIcon, LucideAngularModule, MinusIcon, MoreVerticalIcon, PencilIcon, SparklesIcon, Trash2Icon, XIcon } from 'lucide-angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CombatantNormalizer } from '../../core/combatants/combatant-normalizer.service';

@Component({
    selector: 'app-combatant-card',
    imports: [
        LucideAngularModule,
        TranslatePipe
    ],
    templateUrl: './combatant-card.html',
    styleUrl: './combatant-card.scss'
})
export class CombatantCard {

    @Input() combatant!: Combatant;
    @Input() conditionsOpen = false;
    @Input() activeTurn = false;

    @Output() toggleConditions = new EventEmitter<void>();
    @Output() closeConditions = new EventEmitter<void>();

    @Output() damage = new EventEmitter<number>();
    @Output() healing = new EventEmitter<number>();
    @Output() temporaryHpChange = new EventEmitter<number>();
    @Output() remove = new EventEmitter<void>();
    @Output() edit = new EventEmitter<void>();
    @Output() conditionsChange = new EventEmitter<CombatantConditionKey[]>();
    @Output() conditionStatesChange = new EventEmitter<CombatantConditionState[]>();
    @Output() openSpellSlots = new EventEmitter<void>();
    @Output() spellSlotsChange = new EventEmitter<CombatantSpellSlotLevel[]>();

    readonly conditionCatalog = COMBATANT_CONDITION_CATALOG;
    readonly conditionRoundOptions = Array.from({ length: 10 }, (_, index) => index + 1);
    readonly CheckIcon = CheckIcon;
    actionMenuOpen = false;

    constructor(
        private translate: TranslateService,
        private combatantNormalizer: CombatantNormalizer
    ) {
    }

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

    clearTemporaryHp() {
        this.temporaryHpChange.emit(0);
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

    get tempHpLeftPercent(): number {
        if (this.healthPercent >= 100) {
            return 100 - this.tempHpPercent;
        }

        return this.healthPercent;
    }

    get tempHpVisiblePercent(): number {
        return this.tempHpPercent;
    }

    get activeConditions(): CombatantConditionDefinition[] {
        const current = this.combatant.conditions ?? [];
        return this.conditionCatalog.filter(condition => current.includes(condition.key));
    }

    get spellSlotSummary(): string {
        const slots = this.configuredSpellSlots;

        if (!slots.length) return this.translate.instant('spells.noneConfigured');

        const remaining = slots.reduce((sum, slot) => sum + slot.remaining, 0);
        const total = slots.reduce((sum, slot) => sum + slot.total, 0);
        const levels = slots
            .map(slot => `${slot.level}: ${slot.remaining}/${slot.total}`)
            .join(' | ');

        return this.translate.instant('spells.summary', {
            remaining,
            total,
            levels
        });
    }

    get hasSpellSlots(): boolean {
        return this.normalizedSpellSlots.some(slot => slot.total > 0);
    }

    get configuredSpellSlots(): CombatantSpellSlotLevel[] {
        return this.normalizedSpellSlots.filter(slot => slot.total > 0);
    }

    get spellSlotsRemaining(): number {
        return this.configuredSpellSlots.reduce((sum, slot) => sum + slot.remaining, 0);
    }

    get spellSlotsTotal(): number {
        return this.configuredSpellSlots.reduce((sum, slot) => sum + slot.total, 0);
    }

    get defeatedStatusKey(): string {
        return this.combatant.type === 'PLAYER'
            ? 'combatant.status.unconscious'
            : 'combatant.status.dead';
    }

    isConditionActive(key: CombatantConditionKey): boolean {
        return (this.combatant.conditions ?? []).includes(key);
    }

    toggleCondition(key: CombatantConditionKey) {
        const current = new Set(this.combatant.conditions ?? []);
        const states = this.normalizedConditionStates;

        if (current.has(key)) {
            current.delete(key);
        } else {
            current.add(key);
            states.push({
                key,
                durationMode: 'INDEFINITE'
            });
        }

        const next = this.conditionCatalog
            .map(condition => condition.key)
            .filter(conditionKey => current.has(conditionKey));

        const nextStates = states.filter(state => next.includes(state.key));

        this.conditionsChange.emit(next);
        this.conditionStatesChange.emit(nextStates);
    }

    clearConditions() {
        this.conditionsChange.emit([]);
        this.conditionStatesChange.emit([]);
    }

    setConditionDuration(
        key: CombatantConditionKey,
        mode: CombatantConditionDurationMode,
        event: MouseEvent,
        remainingRounds?: number
    ) {
        event.stopPropagation();

        const conditions = new Set(this.combatant.conditions ?? []);
        conditions.add(key);

        const nextConditions = this.conditionCatalog
            .map(condition => condition.key)
            .filter(conditionKey => conditions.has(conditionKey));
        const nextState: CombatantConditionState = {
            key,
            durationMode: mode,
            remainingRounds: mode === 'ROUNDS' ? remainingRounds : undefined,
            expiresOnCombatantId: mode === 'TURN_START' || mode === 'ROUNDS'
                ? this.combatant.id
                : undefined
        };
        const nextStates = this.normalizedConditionStates
            .filter(state => state.key !== key)
            .concat(nextState)
            .filter(state => nextConditions.includes(state.key));

        this.conditionsChange.emit(nextConditions);
        this.conditionStatesChange.emit(nextStates);
    }

    getConditionState(key: CombatantConditionKey): CombatantConditionState {
        return this.normalizedConditionStates.find(state => state.key === key) ?? {
            key,
            durationMode: 'INDEFINITE'
        };
    }

    getConditionDurationText(key: CombatantConditionKey): string {
        const state = this.getConditionState(key);

        if (state.durationMode === 'TURN_START') {
            return this.translate.instant('conditions.duration.startTurnShort');
        }

        if (state.durationMode === 'ROUNDS') {
            return String(state.remainingRounds ?? 1);
        }

        return '∞';
    }

    getConditionTitle(condition: CombatantConditionDefinition): string {
        const label = this.translate.instant(condition.labelKey);
        const state = this.getConditionState(condition.key);

        if (state.durationMode === 'ROUNDS') {
            return this.translate.instant('conditions.duration.titleWithTurns', {
                condition: label,
                count: state.remainingRounds ?? 1
            });
        }

        if (state.durationMode === 'TURN_START') {
            return this.translate.instant('conditions.duration.titleUntilStart', {
                condition: label
            });
        }

        return this.translate.instant('conditions.duration.titleIndefinite', {
            condition: label
        });
    }


    isConditionDurationActive(
        key: CombatantConditionKey,
        mode: CombatantConditionDurationMode,
        remainingRounds?: number
    ): boolean {
        const state = this.getConditionState(key);

        return state.durationMode === mode
            && (mode !== 'ROUNDS' || state.remainingRounds === remainingRounds);
    }

    spendSpellSlot(level: number, event: MouseEvent) {
        event.stopPropagation();

        const slots = this.normalizedSpellSlots;
        const target = slots.find(slot => slot.level === level);

        if (!target || target.remaining <= 0) return;

        const next = slots.map(slot => slot.level === level
            ? { ...slot, remaining: slot.remaining - 1 }
            : slot
        );

        this.spellSlotsChange.emit(next);
    }

    @HostListener('document:click')
    onOutsideClick() {
        if (this.conditionsOpen) {
            this.closeConditions.emit();
        }

        this.actionMenuOpen = false;
    }

    onToggleClick(event: MouseEvent) {
        event.stopPropagation();
        this.toggleConditions.emit();
    }

    onActionMenuClick(event: MouseEvent) {
        event.stopPropagation();
        this.actionMenuOpen = !this.actionMenuOpen;
    }

    onRemoveClick(event: MouseEvent) {
        event.stopPropagation();
        this.actionMenuOpen = false;
        this.remove.emit();
    }

    onEditClick(event: MouseEvent) {
        event.stopPropagation();
        this.actionMenuOpen = false;
        this.edit.emit();
    }

    selectNumberValue(event: FocusEvent | MouseEvent) {
        const input = event.target as HTMLInputElement;

        input.select();
    }

    scrollDurationOptions(event: WheelEvent) {
        const container = event.currentTarget as HTMLElement;
        const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
            ? event.deltaY
            : event.deltaX;

        if (!delta) return;

        event.preventDefault();
        event.stopPropagation();
        container.scrollLeft += delta;
    }

    private get normalizedSpellSlots(): CombatantSpellSlotLevel[] {
        return this.combatantNormalizer.normalizeConfiguredSpellSlots(this.combatant.spellSlots);
    }

    private get normalizedConditionStates(): CombatantConditionState[] {
        return this.combatantNormalizer.normalizeConditionStates(this.combatant);
    }

    protected readonly SparklesIcon = SparklesIcon;
    protected readonly MinusIcon = MinusIcon;
    protected readonly MoreVerticalIcon = MoreVerticalIcon;
    protected readonly PencilIcon = PencilIcon;
    protected readonly Trash2Icon = Trash2Icon;
    protected readonly XIcon = XIcon;
}

import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combatant, CombatantSpellSlotLevel } from '../../core/entities/combatant';
import { CheckIcon, EraserIcon, LucideAngularModule, RotateCcwIcon, XIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { CombatantNormalizer } from '../../core/combatants/combatant-normalizer.service';
import { MODAL_ANIMATION_DIRECTIVES } from '../../shared/modal-animation.directive';

@Component({
    selector: 'app-spell-slots-modal',
    imports: [CommonModule, LucideAngularModule, TranslatePipe, MODAL_ANIMATION_DIRECTIVES],
    templateUrl: './spell-slots-modal.html',
    styleUrl: './spell-slots-modal.scss'
})
export class SpellSlotsModal {
    @Input({ required: true }) combatant!: Combatant;

    @Output() close = new EventEmitter<void>();
    @Output() spellSlotsChange = new EventEmitter<CombatantSpellSlotLevel[]>();

    readonly spellLevels = Array.from({ length: 9 }, (_, index) => index + 1);

    constructor(private combatantNormalizer: CombatantNormalizer) {
    }

    getSlot(level: number): CombatantSpellSlotLevel {
        return this.combatant.spellSlots?.find(slot => slot.level === level) ?? {
            level,
            total: 0,
            remaining: 0
        };
    }

    updateTotal(level: number, value: string) {
        const total = this.parseSlotValue(value);
        const current = this.getSlot(level);

        this.emitSlots(level, {
            total,
            remaining: Math.min(current.remaining, total)
        });
    }

    updateRemaining(level: number, value: string) {
        const current = this.getSlot(level);
        const remaining = Math.min(this.parseSlotValue(value), current.total);

        this.emitSlots(level, {
            remaining
        });
    }

    selectNumberValue(event: FocusEvent | MouseEvent) {
        const input = event.target as HTMLInputElement;

        input.select();
    }

    resetRemaining(level: number) {
        const current = this.getSlot(level);

        this.emitSlots(level, {
            remaining: current.total
        });
    }

    resetAllRemaining() {
        const next = this.normalizedSlots().map(slot => ({
            ...slot,
            remaining: slot.total
        }));

        this.spellSlotsChange.emit(next);
    }

    clearLevel(level: number) {
        this.emitSlots(level, {
            total: 0,
            remaining: 0
        });
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' || event.key === 'Enter') {
            event.preventDefault();
            this.close.emit();
        }
    }

    private emitSlots(level: number, changes: Partial<CombatantSpellSlotLevel>) {
        const current = this.getSlot(level);
        const updated: CombatantSpellSlotLevel = {
            ...current,
            ...changes
        };

        updated.total = Math.max(0, updated.total);
        updated.remaining = Math.max(0, Math.min(updated.remaining, updated.total));

        const next = this.normalizedSlots()
            .map(slot => slot.level === level ? updated : slot)
            .filter(slot => slot.total > 0 || slot.remaining > 0);

        this.spellSlotsChange.emit(next);
    }

    private normalizedSlots(): CombatantSpellSlotLevel[] {
        return this.combatantNormalizer.normalizeSpellSlotsForLevels(
            this.combatant.spellSlots,
            this.spellLevels
        );
    }

    private parseSlotValue(value: string): number {
        const parsed = Math.floor(Number(value));

        if (isNaN(parsed) || parsed < 0) return 0;

        return parsed;
    }

    protected readonly CheckIcon = CheckIcon;
    protected readonly EraserIcon = EraserIcon;
    protected readonly RotateCcwIcon = RotateCcwIcon;
    protected readonly XIcon = XIcon;
}

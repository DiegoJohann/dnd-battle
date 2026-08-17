import { Injectable } from '@angular/core';
import {
    Combatant,
    CombatantConditionKey,
    CombatantConditionState,
    CombatantSpellSlotLevel,
} from '../entities/combatant';

@Injectable({
    providedIn: 'root',
})
export class CombatantNormalizer {
    normalizeCombatants(value: unknown): Combatant[] {
        if (!Array.isArray(value)) {
            throw new Error('Invalid combatants payload');
        }

        return value.map((combatant) => this.normalizeCombatant(combatant));
    }

    normalizeCombatant(value: unknown): Combatant {
        const partial = value as Partial<Combatant>;
        const maxHp = Math.max(1, Math.floor(Number(partial.maxHp)) || 1);
        const currentHp = Math.max(
            0,
            Math.min(Math.floor(Number(partial.currentHp)) || maxHp, maxHp),
        );
        const type = partial.type === 'PLAYER' ? 'PLAYER' : 'NPC';

        return {
            id: typeof partial.id === 'string' && partial.id ? partial.id : crypto.randomUUID(),
            groupId:
                typeof partial.groupId === 'string' && partial.groupId
                    ? partial.groupId
                    : undefined,
            name:
                typeof partial.name === 'string' && partial.name.trim()
                    ? partial.name.trim()
                    : 'Combatant',
            type,
            armorClass: Math.max(1, Math.floor(Number(partial.armorClass)) || 10),
            initiative: Math.floor(Number(partial.initiative)) || 0,
            maxHp,
            currentHp,
            temporaryHp: Math.max(0, Math.floor(Number(partial.temporaryHp)) || 0),
            alive: typeof partial.alive === 'boolean' ? partial.alive : currentHp > 0,
            conditions: Array.isArray(partial.conditions) ? partial.conditions : [],
            conditionStates: this.normalizeConditionStates(partial),
            spellSlots: this.normalizeSpellSlots(partial.spellSlots),
        };
    }

    normalizeConditionStates(combatant: Partial<Combatant>): CombatantConditionState[] {
        const activeConditions = Array.isArray(combatant.conditions) ? combatant.conditions : [];
        const activeKeys = new Set(activeConditions);
        const currentStates = Array.isArray(combatant.conditionStates)
            ? combatant.conditionStates
            : [];

        return activeConditions
            .map((key) => {
                const state = currentStates.find((currentState) => currentState.key === key);
                const durationMode = String(state?.durationMode ?? 'INDEFINITE');

                if (!state) {
                    return {
                        key,
                        durationMode: 'INDEFINITE' as const,
                    };
                }

                if (durationMode === 'ROUNDS') {
                    return {
                        key,
                        durationMode: 'ROUNDS' as const,
                        remainingRounds: Math.max(
                            1,
                            Math.floor(Number(state.remainingRounds)) || 1,
                        ),
                    };
                }

                if (durationMode === 'TURN_START' || durationMode === 'TURN_END') {
                    return {
                        key,
                        durationMode: 'TURN_START' as const,
                        expiresOnCombatantId: state.expiresOnCombatantId ?? combatant.id,
                    };
                }

                return {
                    key,
                    durationMode: 'INDEFINITE' as const,
                };
            })
            .filter((state) => activeKeys.has(state.key));
    }

    normalizeSpellSlots(value: unknown): CombatantSpellSlotLevel[] {
        if (!Array.isArray(value)) return [];

        return value
            .map((slot) => this.normalizeSpellSlot(slot))
            .filter((slot): slot is CombatantSpellSlotLevel => !!slot);
    }

    normalizeSpellSlotsForLevels(
        slots: CombatantSpellSlotLevel[] | undefined,
        levels: number[],
    ): CombatantSpellSlotLevel[] {
        return levels.map((level) => {
            const slot = slots?.find((currentSlot) => currentSlot.level === level) ?? {
                level,
                total: 0,
                remaining: 0,
            };
            const total = Math.max(0, Math.floor(Number(slot.total)) || 0);

            return {
                level,
                total,
                remaining: Math.max(0, Math.min(Math.floor(Number(slot.remaining)) || 0, total)),
            };
        });
    }

    normalizeConfiguredSpellSlots(
        slots: CombatantSpellSlotLevel[] | undefined,
    ): CombatantSpellSlotLevel[] {
        return this.normalizeSpellSlots(slots);
    }

    private normalizeSpellSlot(value: unknown): CombatantSpellSlotLevel | null {
        const slot = value as Partial<CombatantSpellSlotLevel>;
        const level = Math.floor(Number(slot.level));
        const total = Math.max(0, Math.floor(Number(slot.total)) || 0);
        const remaining = Math.max(0, Math.min(Math.floor(Number(slot.remaining)) || 0, total));

        if (level < 1 || level > 9) return null;

        return { level, total, remaining };
    }
}

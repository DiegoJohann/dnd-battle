import { Injectable } from '@angular/core';
import { Combatant } from '../entities/combatant';
import { CombatantNormalizer } from '../combatants/combatant-normalizer.service';

export interface BattleTurnState {
    round: number;
    activeCombatantId: string | null;
}

const BATTLE_STORAGE_KEY = 'battle';
const BATTLE_TURN_STORAGE_KEY = 'battle-turn';

@Injectable({
    providedIn: 'root'
})
export class BattleStorageService {
    constructor(private combatantNormalizer: CombatantNormalizer) {
    }

    saveBattle(combatants: Combatant[]) {
        localStorage.setItem(BATTLE_STORAGE_KEY, JSON.stringify(combatants));
    }

    loadBattle(): Combatant[] | null {
        const saved = localStorage.getItem(BATTLE_STORAGE_KEY);
        if (!saved) return null;

        try {
            return this.combatantNormalizer.normalizeCombatants(JSON.parse(saved));
        } catch {
            localStorage.removeItem(BATTLE_STORAGE_KEY);
            localStorage.removeItem(BATTLE_TURN_STORAGE_KEY);
            return null;
        }
    }

    saveTurn(turn: BattleTurnState) {
        localStorage.setItem(BATTLE_TURN_STORAGE_KEY, JSON.stringify(turn));
    }

    loadTurn(): BattleTurnState | null {
        const saved = localStorage.getItem(BATTLE_TURN_STORAGE_KEY);
        if (!saved) return null;

        try {
            const parsed = JSON.parse(saved) as Partial<BattleTurnState>;

            return {
                round: Math.max(1, Math.floor(Number(parsed.round)) || 1),
                activeCombatantId: typeof parsed.activeCombatantId === 'string'
                    ? parsed.activeCombatantId
                    : null
            };
        } catch {
            localStorage.removeItem(BATTLE_TURN_STORAGE_KEY);
            return null;
        }
    }
}

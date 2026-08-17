import { Injectable } from '@angular/core';
import { Combatant } from '../entities/combatant';
import { BattleTurnState } from '../battle/battle-storage.service';
import { CombatantNormalizer } from '../combatants/combatant-normalizer.service';

export interface EncounterData {
    schema: 'dnd-battle.encounter';
    version: 1;
    name: string;
    savedAt: string;
    combatants: Combatant[];
    turn: BattleTurnState;
}

@Injectable({
    providedIn: 'root',
})
export class EncounterSerializerService {
    constructor(private combatantNormalizer: CombatantNormalizer) {}

    buildEncounter(name: string, combatants: Combatant[], turn: BattleTurnState): EncounterData {
        return {
            schema: 'dnd-battle.encounter',
            version: 1,
            name,
            savedAt: new Date().toISOString(),
            combatants: this.cloneCombatants(combatants),
            turn,
        };
    }

    parseEncounterJson(json: string, fallbackName: string): EncounterData {
        return this.parseEncounterPayload(JSON.parse(json), fallbackName);
    }

    parseEncounterPayload(payload: unknown, fallbackName: string): EncounterData {
        if (Array.isArray(payload)) {
            return {
                schema: 'dnd-battle.encounter',
                version: 1,
                name: fallbackName,
                savedAt: new Date().toISOString(),
                combatants: this.combatantNormalizer.normalizeCombatants(payload),
                turn: {
                    round: 1,
                    activeCombatantId: null,
                },
            };
        }

        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid encounter payload');
        }

        const data = payload as Partial<EncounterData> & Partial<BattleTurnState>;
        const turn = data.turn ?? {
            round: data.round,
            activeCombatantId: data.activeCombatantId,
        };

        return {
            schema: 'dnd-battle.encounter',
            version: 1,
            name:
                typeof data.name === 'string' && data.name.trim() ? data.name.trim() : fallbackName,
            savedAt: typeof data.savedAt === 'string' ? data.savedAt : new Date().toISOString(),
            combatants: this.combatantNormalizer.normalizeCombatants(data.combatants),
            turn: {
                round: Math.max(1, Math.floor(Number(turn.round)) || 1),
                activeCombatantId:
                    typeof turn.activeCombatantId === 'string' ? turn.activeCombatantId : null,
            },
        };
    }

    downloadEncounter(encounter: EncounterData) {
        const blob = new Blob([JSON.stringify(encounter, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = `${this.slugify(encounter.name)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    slugify(value: string): string {
        return (
            value
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || 'encounter'
        );
    }

    private cloneCombatants(combatants: Combatant[]): Combatant[] {
        return JSON.parse(JSON.stringify(combatants)) as Combatant[];
    }
}

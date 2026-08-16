import { Injectable } from '@angular/core';
import { CombatantPreset, CombatantLibrary } from '../entities/combatant-preset';
import { CombatantNormalizer } from '../combatants/combatant-normalizer.service';

@Injectable({
    providedIn: 'root',
})
export class LibrarySerializerService {
    constructor(private combatantNormalizer: CombatantNormalizer) {}

    buildLibrary(name: string, presets: CombatantPreset[]): CombatantLibrary {
        return {
            schema: 'dnd-battle.library',
            version: 1,
            name,
            presets: this.clonePresets(presets),
            savedAt: new Date().toISOString(),
        };
    }

    parseLibraryJson(json: string, fallbackName: string): CombatantLibrary {
        return this.parseLibraryPayload(JSON.parse(json), fallbackName);
    }

    parseLibraryPayload(payload: unknown, fallbackName: string): CombatantLibrary {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('Invalid library payload');
        }

        const data = payload as Partial<CombatantLibrary>;

        return {
            schema: 'dnd-battle.library',
            version: 1,
            name:
                typeof data.name === 'string' && data.name.trim() ? data.name.trim() : fallbackName,
            presets: this.normalizePresets(data.presets),
            savedAt: typeof data.savedAt === 'string' ? data.savedAt : new Date().toISOString(),
        };
    }

    downloadLibrary(library: CombatantLibrary) {
        const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = `${this.slugify(library.name)}.json`;
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
                .replace(/(^-|-$)/g, '') || 'library'
        );
    }

    private normalizePresets(presets: unknown): CombatantPreset[] {
        if (!Array.isArray(presets)) return [];

        return presets
            .filter(
                (p): p is Partial<CombatantPreset> =>
                    typeof p === 'object' && p !== null && !Array.isArray(p),
            )
            .map((preset) => ({
                id: typeof preset.id === 'string' && preset.id ? preset.id : crypto.randomUUID(),
                presetName:
                    typeof preset.presetName === 'string' && preset.presetName.trim()
                        ? preset.presetName.trim()
                        : 'Combatant',
                name: typeof preset.name === 'string' ? preset.name.trim() : '',
                type: preset.type === 'PLAYER' ? 'PLAYER' : 'NPC',
                armorClass: Math.max(1, Math.floor(Number(preset.armorClass)) || 10),
                maxHp: Math.max(1, Math.floor(Number(preset.maxHp)) || 1),
                initiativeBonus: Math.floor(Number(preset.initiativeBonus)) || 0,
                spellSlots: this.combatantNormalizer.normalizeConfiguredSpellSlots(
                    preset.spellSlots,
                ),
            }));
    }

    private clonePresets(presets: CombatantPreset[]): CombatantPreset[] {
        return JSON.parse(JSON.stringify(presets)) as CombatantPreset[];
    }
}

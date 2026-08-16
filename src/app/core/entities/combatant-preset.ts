import { CombatantSpellSlotLevel, CombatantType } from './combatant';

export interface CombatantPreset {
    id: string;
    presetName: string;
    name: string;
    type: CombatantType;
    armorClass: number;
    maxHp: number;
    initiativeBonus: number;
    spellSlots?: CombatantSpellSlotLevel[];
}

export interface CombatantLibrary {
    schema: 'dnd-battle.library';
    version: 1;
    name: string;
    presets: CombatantPreset[];
    savedAt: string;
}

export interface SavedLibrary extends CombatantLibrary {
    id: string;
}

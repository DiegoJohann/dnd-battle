export type CombatantType = 'PLAYER' | 'NPC';

export interface Combatant {
    id: string;
    name: string;

    maxHp: number;
    currentHp: number;

    armorClass: number;
    initiative: number;

    alive: boolean;
    type: CombatantType;
}

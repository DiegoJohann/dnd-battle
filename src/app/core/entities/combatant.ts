export type CombatantType = 'PLAYER' | 'NPC';

export type CombatantConditionKey =
    | 'BLINDED'
    | 'CHARMED'
    | 'DEAFENED'
    | 'FRIGHTENED'
    | 'GRAPPLED'
    | 'INCAPACITATED'
    | 'INVISIBLE'
    | 'PARALYZED'
    | 'PETRIFIED'
    | 'POISONED'
    | 'PRONE'
    | 'RESTRAINED'
    | 'STUNNED'
    | 'UNCONSCIOUS'
    | 'EXHAUSTION_1'
    | 'EXHAUSTION_2'
    | 'EXHAUSTION_3'
    | 'EXHAUSTION_4'
    | 'EXHAUSTION_5'
    | 'EXHAUSTION_6';

export type CombatantConditionTone = 'info' | 'warning' | 'danger' | 'neutral';
export type CombatantConditionDurationMode = 'INDEFINITE' | 'TURN_START' | 'ROUNDS';

export interface CombatantConditionDefinition {
    key: CombatantConditionKey;
    labelKey: string;
    icon: string;
    tone: CombatantConditionTone;
}

export interface CombatantSpellSlotLevel {
    level: number;
    total: number;
    remaining: number;
}

export interface CombatantConditionState {
    key: CombatantConditionKey;
    durationMode: CombatantConditionDurationMode;
    remainingRounds?: number;
    expiresOnCombatantId?: string;
}

export const COMBATANT_CONDITION_CATALOG: CombatantConditionDefinition[] = [
    { key: 'BLINDED', labelKey: 'conditions.BLINDED', icon: '👁️', tone: 'info' },
    { key: 'CHARMED', labelKey: 'conditions.CHARMED', icon: '💘', tone: 'warning' },
    { key: 'DEAFENED', labelKey: 'conditions.DEAFENED', icon: '🔇', tone: 'info' },
    { key: 'FRIGHTENED', labelKey: 'conditions.FRIGHTENED', icon: '😱', tone: 'warning' },
    { key: 'GRAPPLED', labelKey: 'conditions.GRAPPLED', icon: '✋', tone: 'warning' },
    { key: 'INCAPACITATED', labelKey: 'conditions.INCAPACITATED', icon: '⛔', tone: 'danger' },
    { key: 'INVISIBLE', labelKey: 'conditions.INVISIBLE', icon: '👻', tone: 'info' },
    { key: 'PARALYZED', labelKey: 'conditions.PARALYZED', icon: '🧊', tone: 'danger' },
    { key: 'PETRIFIED', labelKey: 'conditions.PETRIFIED', icon: '🪨', tone: 'danger' },
    { key: 'POISONED', labelKey: 'conditions.POISONED', icon: '☠️', tone: 'danger' },
    { key: 'PRONE', labelKey: 'conditions.PRONE', icon: '⬇️', tone: 'neutral' },
    { key: 'RESTRAINED', labelKey: 'conditions.RESTRAINED', icon: '🪢', tone: 'warning' },
    { key: 'STUNNED', labelKey: 'conditions.STUNNED', icon: '💫', tone: 'danger' },
    { key: 'UNCONSCIOUS', labelKey: 'conditions.UNCONSCIOUS', icon: '💤', tone: 'danger' },

    { key: 'EXHAUSTION_1', labelKey: 'conditions.EXHAUSTION_1', icon: '⚡', tone: 'neutral' },
    { key: 'EXHAUSTION_2', labelKey: 'conditions.EXHAUSTION_2', icon: '⚡', tone: 'warning' },
    { key: 'EXHAUSTION_3', labelKey: 'conditions.EXHAUSTION_3', icon: '⚡', tone: 'warning' },
    { key: 'EXHAUSTION_4', labelKey: 'conditions.EXHAUSTION_4', icon: '⚡', tone: 'danger' },
    { key: 'EXHAUSTION_5', labelKey: 'conditions.EXHAUSTION_5', icon: '⚡', tone: 'danger' },
    { key: 'EXHAUSTION_6', labelKey: 'conditions.EXHAUSTION_6', icon: '⚡', tone: 'danger' }
];

export interface Combatant {
    id: string;
    groupId?: string;
    name: string;
    type: CombatantType;
    armorClass: number;
    initiative: number;
    maxHp: number;
    currentHp: number;
    temporaryHp?: number;
    alive: boolean;
    conditions?: CombatantConditionKey[];
    conditionStates?: CombatantConditionState[];
    spellSlots?: CombatantSpellSlotLevel[];
}

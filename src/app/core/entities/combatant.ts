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
    color: string;
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
    { key: 'BLINDED', labelKey: 'conditions.BLINDED', icon: '👁️', tone: 'info', color: '#60a5fa' },
    { key: 'CHARMED', labelKey: 'conditions.CHARMED', icon: '💘', tone: 'warning', color: '#f472b6' },
    { key: 'DEAFENED', labelKey: 'conditions.DEAFENED', icon: '🔇', tone: 'info', color: '#93c5fd' },
    { key: 'FRIGHTENED', labelKey: 'conditions.FRIGHTENED', icon: '😱', tone: 'warning', color: '#facc15' },
    { key: 'GRAPPLED', labelKey: 'conditions.GRAPPLED', icon: '✋', tone: 'warning', color: '#fb923c' },
    { key: 'INCAPACITATED', labelKey: 'conditions.INCAPACITATED', icon: '⛔', tone: 'danger', color: '#f87171' },
    { key: 'INVISIBLE', labelKey: 'conditions.INVISIBLE', icon: '👻', tone: 'info', color: '#a5b4fc' },
    { key: 'PARALYZED', labelKey: 'conditions.PARALYZED', icon: '🧊', tone: 'danger', color: '#67e8f9' },
    { key: 'PETRIFIED', labelKey: 'conditions.PETRIFIED', icon: '🪨', tone: 'danger', color: '#a3a3a3' },
    { key: 'POISONED', labelKey: 'conditions.POISONED', icon: '☠️', tone: 'danger', color: '#4ade80' },
    { key: 'PRONE', labelKey: 'conditions.PRONE', icon: '⬇️', tone: 'neutral', color: '#cbd5f5' },
    { key: 'RESTRAINED', labelKey: 'conditions.RESTRAINED', icon: '🪢', tone: 'warning', color: '#fdba74' },
    { key: 'STUNNED', labelKey: 'conditions.STUNNED', icon: '💫', tone: 'danger', color: '#fde047' },
    { key: 'UNCONSCIOUS', labelKey: 'conditions.UNCONSCIOUS', icon: '💤', tone: 'danger', color: '#c4b5fd' },

    { key: 'EXHAUSTION_1', labelKey: 'conditions.EXHAUSTION_1', icon: '⚡', tone: 'neutral', color: '#fde68a' },
    { key: 'EXHAUSTION_2', labelKey: 'conditions.EXHAUSTION_2', icon: '⚡', tone: 'warning', color: '#fcd34d' },
    { key: 'EXHAUSTION_3', labelKey: 'conditions.EXHAUSTION_3', icon: '⚡', tone: 'warning', color: '#fbbf24' },
    { key: 'EXHAUSTION_4', labelKey: 'conditions.EXHAUSTION_4', icon: '⚡', tone: 'danger', color: '#fb923c' },
    { key: 'EXHAUSTION_5', labelKey: 'conditions.EXHAUSTION_5', icon: '⚡', tone: 'danger', color: '#f87171' },
    { key: 'EXHAUSTION_6', labelKey: 'conditions.EXHAUSTION_6', icon: '⚡', tone: 'danger', color: '#ef4444' }
];

export interface Combatant {
    id: string;
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

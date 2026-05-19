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

export interface CombatantConditionDefinition {
    key: CombatantConditionKey;
    label: string;
    icon: string;
    tone: CombatantConditionTone;
    color: string;
}

export const COMBATANT_CONDITION_CATALOG: CombatantConditionDefinition[] = [
    { key: 'BLINDED', label: 'Cego', icon: '👁️', tone: 'info', color: '#60a5fa' },
    { key: 'CHARMED', label: 'Enfeitiçado', icon: '💘', tone: 'warning', color: '#f472b6' },
    { key: 'DEAFENED', label: 'Surdo', icon: '🔇', tone: 'info', color: '#93c5fd' },
    { key: 'FRIGHTENED', label: 'Assustado', icon: '😱', tone: 'warning', color: '#facc15' },
    { key: 'GRAPPLED', label: 'Agarrado', icon: '✋', tone: 'warning', color: '#fb923c' },
    { key: 'INCAPACITATED', label: 'Incapacitado', icon: '⛔', tone: 'danger', color: '#f87171' },
    { key: 'INVISIBLE', label: 'Invisível', icon: '👻', tone: 'info', color: '#a5b4fc' },
    { key: 'PARALYZED', label: 'Paralisado', icon: '🧊', tone: 'danger', color: '#67e8f9' },
    { key: 'PETRIFIED', label: 'Petrificado', icon: '🪨', tone: 'danger', color: '#a3a3a3' },
    { key: 'POISONED', label: 'Envenenado', icon: '☠️', tone: 'danger', color: '#4ade80' },
    { key: 'PRONE', label: 'Caído', icon: '⬇️', tone: 'neutral', color: '#cbd5f5' },
    { key: 'RESTRAINED', label: 'Contido', icon: '🪢', tone: 'warning', color: '#fdba74' },
    { key: 'STUNNED', label: 'Atordoado', icon: '💫', tone: 'danger', color: '#fde047' },
    { key: 'UNCONSCIOUS', label: 'Inconsciente', icon: '💤', tone: 'danger', color: '#c4b5fd' },

    { key: 'EXHAUSTION_1', label: 'Exaustão 1', icon: '⚡', tone: 'neutral', color: '#fde68a' },
    { key: 'EXHAUSTION_2', label: 'Exaustão 2', icon: '⚡', tone: 'warning', color: '#fcd34d' },
    { key: 'EXHAUSTION_3', label: 'Exaustão 3', icon: '⚡', tone: 'warning', color: '#fbbf24' },
    { key: 'EXHAUSTION_4', label: 'Exaustão 4', icon: '⚡', tone: 'danger', color: '#fb923c' },
    { key: 'EXHAUSTION_5', label: 'Exaustão 5', icon: '⚡', tone: 'danger', color: '#f87171' },
    { key: 'EXHAUSTION_6', label: 'Exaustão 6', icon: '⚡', tone: 'danger', color: '#ef4444' }
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
}

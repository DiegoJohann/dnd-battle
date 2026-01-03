export interface Enemy {
    id: string;
    name: string;
    maxHp: number;
    currentHp: number;
    armorClass: number;
    alive: boolean;
}

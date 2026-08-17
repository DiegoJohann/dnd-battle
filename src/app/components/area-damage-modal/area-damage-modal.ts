import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckIcon, LucideAngularModule, XIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { Combatant } from '../../core/entities/combatant';
import { MODAL_ANIMATION_DIRECTIVES } from '../../shared/modal-animation.directive';
import { ModalFocusTrapDirective } from '../../shared/modal-focus-trap.directive';

export type AreaDamageSaveSuccessEffect = 'HALF' | 'NONE';

export interface AreaDamageResult {
    combatantId: string;
    roll: number;
    saveBonus: number;
    total: number;
    succeeded: boolean;
    damage: number;
}

interface AreaDamageTarget {
    combatant: Combatant;
    selected: boolean;
    saveBonus: number;
    groupSize: number;
}

@Component({
    selector: 'app-area-damage-modal',
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        TranslatePipe,
        ModalFocusTrapDirective,
        MODAL_ANIMATION_DIRECTIVES,
    ],
    templateUrl: './area-damage-modal.html',
    styleUrl: './area-damage-modal.scss',
})
export class AreaDamageModal implements OnChanges {
    @Input({ required: true }) combatants: Combatant[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() applyDamage = new EventEmitter<AreaDamageResult[]>();

    damage = 0;
    saveDc = 15;
    successEffect: AreaDamageSaveSuccessEffect = 'HALF';
    targets: AreaDamageTarget[] = [];

    protected readonly CheckIcon = CheckIcon;
    protected readonly XIcon = XIcon;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['combatants']) {
            this.syncTargets();
        }
    }

    get selectedCount(): number {
        return this.targets.filter((target) => target.selected).length;
    }

    get canApply(): boolean {
        return this.selectedCount > 0 && this.damage > 0 && this.saveDc > 0;
    }

    toggleAll(checked: boolean) {
        this.targets.forEach((target) => {
            target.selected = checked;
        });
    }

    updateSaveBonus(target: AreaDamageTarget, value: number | string) {
        const saveBonus = Math.floor(Number(value)) || 0;
        target.saveBonus = saveBonus;

        if (!target.combatant.groupId) return;

        this.targets
            .filter((currentTarget) => currentTarget.combatant.groupId === target.combatant.groupId)
            .forEach((currentTarget) => {
                currentTarget.saveBonus = saveBonus;
            });
    }

    submit() {
        if (!this.canApply) return;

        const damage = Math.max(0, Math.floor(Number(this.damage)));
        const saveDc = Math.max(1, Math.floor(Number(this.saveDc)));
        const results = this.targets
            .filter((target) => target.selected)
            .map((target) => this.rollTarget(target, damage, saveDc));

        this.applyDamage.emit(results);
        this.close.emit();
    }

    selectNumberValue(event: FocusEvent | MouseEvent) {
        const input = event.target as HTMLInputElement;

        input.select();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.close.emit();
        }

        if (event.key === 'Enter' && this.canApply) {
            event.preventDefault();
            this.submit();
        }
    }

    private syncTargets() {
        const previousBonuses = new Map(
            this.targets.map((target) => [target.combatant.id, target.saveBonus]),
        );
        const npcs = this.combatants
            .filter((combatant) => combatant.type === 'NPC' && combatant.alive)
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, {
                    numeric: true,
                    sensitivity: 'base',
                }),
            );
        const groupSizes = npcs.reduce((groups, combatant) => {
            if (!combatant.groupId) return groups;

            groups.set(combatant.groupId, (groups.get(combatant.groupId) ?? 0) + 1);
            return groups;
        }, new Map<string, number>());

        this.targets = npcs.map((combatant) => ({
            combatant,
            selected: true,
            saveBonus: previousBonuses.get(combatant.id) ?? 0,
            groupSize: combatant.groupId ? (groupSizes.get(combatant.groupId) ?? 1) : 1,
        }));
    }

    private rollTarget(target: AreaDamageTarget, damage: number, saveDc: number): AreaDamageResult {
        const roll = Math.floor(Math.random() * 20) + 1;
        const saveBonus = Math.floor(Number(target.saveBonus)) || 0;
        const total = roll + saveBonus;
        const succeeded = total >= saveDc;

        return {
            combatantId: target.combatant.id,
            roll,
            saveBonus,
            total,
            succeeded,
            damage: this.resolveDamage(damage, succeeded),
        };
    }

    private resolveDamage(damage: number, succeeded: boolean): number {
        if (!succeeded) return damage;

        return this.successEffect === 'HALF' ? Math.floor(damage / 2) : 0;
    }
}

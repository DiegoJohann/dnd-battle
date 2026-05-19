import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Combatant, CombatantType } from '../../core/entities/combatant';
import { BugIcon, CircleQuestionMark, LucideAngularModule, UserIcon, UsersIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';

type CombatantCreateMode = 'single' | 'group';

@Component({
    selector: 'app-add-combatant-modal',
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslatePipe],
    templateUrl: './add-combatant-modal.html',
    styleUrl: './add-combatant-modal.scss',
})
export class AddCombatantModal implements AfterViewInit {
    @Output() close = new EventEmitter<void>();
    @Output() create = new EventEmitter<Combatant[]>();

    @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

    form;

    constructor(private fb: NonNullableFormBuilder) {
        this.form = this.fb.group({
            mode: ['single' as CombatantCreateMode, Validators.required],
            name: ['', Validators.required],
            quantity: [2, [Validators.required, Validators.min(1), Validators.max(50)]],
            hp: [null, [Validators.required, Validators.min(1)]],
            ac: [null, [Validators.required, Validators.min(1)]],
            initiative: [0, [Validators.required, Validators.min(-20), Validators.max(50)]],
            individualInitiative: [false],
            type: ['NPC' as CombatantType, Validators.required]
        });
    }

    ngAfterViewInit() {
        this.nameInput.nativeElement.focus();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.close.emit();
        }
    }

    submit() {
        if (this.form.invalid) return;

        const {
            mode,
            name,
            quantity,
            hp,
            ac,
            initiative,
            individualInitiative,
            type
        } = this.form.getRawValue();
        const count = mode === 'group'
            ? Math.max(1, Math.min(50, Math.floor(Number(quantity)) || 1))
            : 1;
        const baseInitiative = initiative ?? 0;
        const combatants = Array.from({ length: count }, (_, index) => ({
            id: crypto.randomUUID(),
            name: count > 1 ? `${name!} ${index + 1}` : name!,
            maxHp: hp!,
            currentHp: hp!,
            armorClass: ac!,
            initiative: mode === 'group' && individualInitiative
                ? this.rollInitiative(baseInitiative)
                : baseInitiative,
            alive: true,
            type
        }));

        this.create.emit(combatants);

        this.close.emit();
    }

    private rollInitiative(modifier: number): number {
        return Math.floor(Math.random() * 20) + 1 + modifier;
    }

    protected readonly BugIcon = BugIcon;
    protected readonly CircleQuestionMark = CircleQuestionMark;
    protected readonly UserIcon = UserIcon;
    protected readonly UsersIcon = UsersIcon;
}

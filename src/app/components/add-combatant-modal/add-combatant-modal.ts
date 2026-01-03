import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Combatant, CombatantType } from '../../core/entities/combatant';

@Component({
    selector: 'app-add-combatant-modal',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './add-combatant-modal.html',
    styleUrl: './add-combatant-modal.scss',
})
export class AddCombatantModal implements AfterViewInit {
    @Output() close = new EventEmitter<void>();
    @Output() create = new EventEmitter<Combatant>();

    @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

    form;

    constructor(private fb: NonNullableFormBuilder) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            hp: [null, [Validators.required, Validators.min(1)]],
            ac: [null, [Validators.required, Validators.min(1)]],
            initiative: [0, Validators.min(0)],
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

        const {name, hp, ac, initiative, type} = this.form.getRawValue();

        this.create.emit({
            id: crypto.randomUUID(),
            name: name!,
            maxHp: hp!,
            currentHp: hp!,
            armorClass: ac!,
            initiative: initiative ?? 0,
            alive: true,
            type
        });

        this.close.emit();
    }
}

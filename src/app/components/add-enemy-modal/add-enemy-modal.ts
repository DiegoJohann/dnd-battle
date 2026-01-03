import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Enemy } from '../../core/entities/enemy';

@Component({
    selector: 'app-add-enemy-modal',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './add-enemy-modal.html',
    styleUrl: './add-enemy-modal.scss',
})
export class AddEnemyModal implements AfterViewInit {
    @Output() close = new EventEmitter<void>();
    @Output() create = new EventEmitter<Enemy>();

    @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

    form;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            hp: [null, [Validators.required, Validators.min(1)]],
            ac: [null, [Validators.required, Validators.min(1)]],
            initiative: [0, Validators.min(0)],
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

        const {name, hp, ac, initiative} = this.form.value;

        this.create.emit({
            id: crypto.randomUUID(),
            name: name!,
            maxHp: hp!,
            currentHp: hp!,
            armorClass: ac!,
            initiative: initiative ?? 0,
            alive: true
        });

        this.close.emit();
    }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [],
    templateUrl: './confirmation-dialog.html',
    styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {

    @Input() confimationMessage: string = "Tem certeza?";
    @Input() acceptLabel: string = "Sim";
    @Input() rejectLabel: string = "Não";

    @Output() actionConfirmed = new EventEmitter();
    @Output() actionRejected = new EventEmitter();

    confirm() {
        this.actionConfirmed.emit();
    }

    reject() {
        this.actionRejected.emit();
    }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [TranslatePipe],
    templateUrl: './confirmation-dialog.html',
    styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {

    @Input() confirmationMessage: string = 'common.areYouSure';
    @Input() acceptLabel: string = 'common.yes';
    @Input() rejectLabel: string = 'common.no';

    @Output() actionConfirmed = new EventEmitter();
    @Output() actionRejected = new EventEmitter();

    confirm() {
        this.actionConfirmed.emit();
    }

    reject() {
        this.actionRejected.emit();
    }
}

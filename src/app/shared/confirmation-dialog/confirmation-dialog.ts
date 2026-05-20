import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalFocusTrapDirective } from '../modal-focus-trap.directive';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [TranslatePipe, ModalFocusTrapDirective],
    templateUrl: './confirmation-dialog.html',
    styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog implements AfterViewInit {

    @Input() confirmationMessage: string = 'common.areYouSure';
    @Input() acceptLabel: string = 'common.yes';
    @Input() rejectLabel: string = 'common.no';

    @Output() actionConfirmed = new EventEmitter();
    @Output() actionRejected = new EventEmitter();

    @ViewChild('rejectButton') rejectButton!: ElementRef<HTMLButtonElement>;

    ngAfterViewInit() {
        setTimeout(() => this.rejectButton.nativeElement.focus());
    }

    confirm() {
        this.actionConfirmed.emit();
    }

    reject() {
        this.actionRejected.emit();
    }
}

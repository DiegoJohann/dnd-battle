import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [TranslatePipe],
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

    trapModalTab(event: Event, modal: HTMLElement) {
        const keyboardEvent = event as KeyboardEvent;
        const focusableElements = Array.from(
            modal.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter(element => !element.hasAttribute('disabled') && element.offsetParent !== null);

        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (keyboardEvent.shiftKey && activeElement === firstElement) {
            keyboardEvent.preventDefault();
            lastElement.focus();
            return;
        }

        if (!keyboardEvent.shiftKey && activeElement === lastElement) {
            keyboardEvent.preventDefault();
            firstElement.focus();
        }
    }
}

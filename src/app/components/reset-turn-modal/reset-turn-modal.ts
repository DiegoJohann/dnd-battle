import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalFocusTrapDirective } from '../../shared/modal-focus-trap.directive';

@Component({
    selector: 'app-reset-turn-modal',
    imports: [TranslatePipe, ModalFocusTrapDirective],
    templateUrl: './reset-turn-modal.html',
    styleUrl: './reset-turn-modal.scss'
})
export class ResetTurnModal implements AfterViewInit {
    @Output() reset = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    @ViewChild('cancelButton') cancelButton!: ElementRef<HTMLButtonElement>;

    ngAfterViewInit() {
        setTimeout(() => this.cancelButton.nativeElement.focus());
    }
}

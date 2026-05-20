import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalFocusTrapDirective } from '../../shared/modal-focus-trap.directive';
import { MODAL_ANIMATION_DIRECTIVES } from '../../shared/modal-animation.directive';

export type ClearBattleType = 'NPC' | 'PLAYER' | 'ALL';

@Component({
    selector: 'app-clear-battle-modal',
    imports: [TranslatePipe, ModalFocusTrapDirective, MODAL_ANIMATION_DIRECTIVES],
    templateUrl: './clear-battle-modal.html',
    styleUrl: './clear-battle-modal.scss'
})
export class ClearBattleModal implements AfterViewInit {
    @Output() clear = new EventEmitter<ClearBattleType>();
    @Output() close = new EventEmitter<void>();

    @ViewChild('cancelButton') cancelButton!: ElementRef<HTMLButtonElement>;

    ngAfterViewInit() {
        setTimeout(() => this.cancelButton.nativeElement.focus());
    }
}

import { Directive } from '@angular/core';

@Directive({
    selector: '.overlay',
    host: {
        'animate.enter': 'modal-overlay-enter',
        'animate.leave': 'modal-overlay-leave'
    }
})
export class ModalOverlayAnimationDirective {
}

@Directive({
    selector: '.modal',
    host: {
        'animate.enter': 'modal-panel-enter',
        'animate.leave': 'modal-panel-leave'
    }
})
export class ModalPanelAnimationDirective {
}

export const MODAL_ANIMATION_DIRECTIVES = [
    ModalOverlayAnimationDirective,
    ModalPanelAnimationDirective
] as const;

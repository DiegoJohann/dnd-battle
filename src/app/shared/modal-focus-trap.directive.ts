import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appModalFocusTrap]',
})
export class ModalFocusTrapDirective {
    constructor(private elementRef: ElementRef<HTMLElement>) {}

    @HostListener('keydown.tab', ['$event'])
    trapTab(event: Event) {
        const keyboardEvent = event as KeyboardEvent;
        const focusableElements = Array.from(
            this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);

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

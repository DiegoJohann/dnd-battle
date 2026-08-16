import { Injectable } from '@angular/core';

export type BattleHotkeyAction =
    | 'ADD_COMBATANT'
    | 'CLEAR_BATTLEFIELD'
    | 'CLOSE_OVERLAYS'
    | 'NEXT_TURN'
    | 'OPEN_LIBRARY'
    | 'PREVIOUS_TURN'
    | 'RESET_TURN';

export interface BattleHotkeyMatch {
    action: BattleHotkeyAction;
    preventDefault: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class HotkeysService {
    matchBattleHotkey(event: KeyboardEvent): BattleHotkeyMatch | null {
        if (event.key === 'Escape') {
            return { action: 'CLOSE_OVERLAYS', preventDefault: true };
        }

        if (this.isEditableTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
            return null;
        }

        if (event.key === 'ArrowRight') {
            return { action: 'NEXT_TURN', preventDefault: true };
        }

        if (event.key === 'ArrowLeft') {
            return { action: 'PREVIOUS_TURN', preventDefault: true };
        }

        switch (event.key.toLowerCase()) {
            case 'a':
                return { action: 'ADD_COMBATANT', preventDefault: true };
            case 'b':
                return { action: 'OPEN_LIBRARY', preventDefault: true };
            case 'c':
                return { action: 'CLEAR_BATTLEFIELD', preventDefault: true };
            case 'n':
                return { action: 'NEXT_TURN', preventDefault: true };
            case 'p':
                return { action: 'PREVIOUS_TURN', preventDefault: true };
            case 'r':
                return { action: 'RESET_TURN', preventDefault: true };
            default:
                return null;
        }
    }

    private isEditableTarget(target: EventTarget | null): boolean {
        if (!(target instanceof HTMLElement)) return false;

        return (
            target.isContentEditable ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT'
        );
    }
}

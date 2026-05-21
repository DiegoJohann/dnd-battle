import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChevronLeftIcon, ChevronRightIcon, ListOrderedIcon, LucideAngularModule, RotateCcwIcon } from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-turn-tracker',
    imports: [LucideAngularModule, TranslatePipe],
    templateUrl: './turn-tracker.html',
    styleUrl: './turn-tracker.scss'
})
export class TurnTrackerComponent {
    @Input({ required: true }) round = 1;
    @Input() activeCombatantName: string | undefined;
    @Input() hasCombatants = false;

    @Output() resetTurn = new EventEmitter<void>();
    @Output() setInitiative = new EventEmitter<void>();
    @Output() previousTurn = new EventEmitter<void>();
    @Output() nextTurn = new EventEmitter<void>();

    protected readonly ChevronLeftIcon = ChevronLeftIcon;
    protected readonly ChevronRightIcon = ChevronRightIcon;
    protected readonly ListOrderedIcon = ListOrderedIcon;
    protected readonly RotateCcwIcon = RotateCcwIcon;
}

import { Component } from '@angular/core';
import { Battle } from './components/battle/battle';

@Component({
    selector: 'app-root',
    imports: [Battle],
    template: `
        <app-battle/>`,
    styleUrl: './app.scss'
})
export class App {
}

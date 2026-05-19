import { Component } from '@angular/core';
import { Battle } from './components/battle/battle';
import { LanguageService } from './core/i18n/language.service';

@Component({
    selector: 'app-root',
    imports: [Battle],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    constructor(languageService: LanguageService) {
        languageService.initialize();
    }
}

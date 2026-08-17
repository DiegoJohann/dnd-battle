import { Component, afterNextRender, Injector } from '@angular/core';
import { Battle } from './components/battle/battle';
import { LanguageService } from './core/i18n/language.service';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';

@Component({
    selector: 'app-root',
    imports: [Battle],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    constructor(languageService: LanguageService, injector: Injector) {
        languageService.initialize();

        // Initialize Vercel Speed Insights and Web Analytics
        afterNextRender(
            () => {
                injectSpeedInsights();
                inject();
            },
            { injector },
        );
    }
}

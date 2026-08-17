import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import {
    DEFAULT_LANGUAGE,
    isSupportedLanguage,
    LANGUAGE_STORAGE_KEY,
    SUPPORTED_LANGUAGES,
    SupportedLanguage,
} from './i18n';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    readonly supportedLanguages = SUPPORTED_LANGUAGES;

    private _currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

    constructor(
        private translate: TranslateService,
        @Inject(DOCUMENT) private document: Document,
    ) {}

    initialize() {
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const language = isSupportedLanguage(savedLanguage)
            ? savedLanguage
            : this.getBrowserLanguage();

        this.translate.addLangs([...SUPPORTED_LANGUAGES]);
        this.use(language);
    }

    use(language: SupportedLanguage) {
        this._currentLanguage = language;
        this.translate.use(language);
        this.document.documentElement.lang = language;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }

    get currentLanguage(): SupportedLanguage {
        return this._currentLanguage;
    }

    private getBrowserLanguage(): SupportedLanguage {
        const browserLanguage = navigator.language;

        if (isSupportedLanguage(browserLanguage)) return browserLanguage;
        if (browserLanguage.toLowerCase().startsWith('es')) return 'es';
        if (browserLanguage.toLowerCase().startsWith('en')) return 'en-US';

        return DEFAULT_LANGUAGE;
    }
}

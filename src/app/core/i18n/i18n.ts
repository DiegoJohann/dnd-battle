import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'es', 'en-US'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en-US';
export const LANGUAGE_STORAGE_KEY = 'dnd-battle-language';

@Injectable()
export class JsonTranslateLoader implements TranslateLoader {
    constructor(private http: HttpClient) {
    }

    getTranslation(lang: string): Observable<TranslationObject> {
        return this.http.get<TranslationObject>(`/assets/i18n/${lang}.json`);
    }
}

export function isSupportedLanguage(language: string | null | undefined): language is SupportedLanguage {
    return !!language && SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

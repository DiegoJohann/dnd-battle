import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { DEFAULT_LANGUAGE, JsonTranslateLoader } from './core/i18n/i18n';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(),
        provideTranslateService({
            fallbackLang: DEFAULT_LANGUAGE,
            lang: DEFAULT_LANGUAGE,
            loader: provideTranslateLoader(JsonTranslateLoader),
        }),
    ],
};

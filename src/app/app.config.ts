import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { CONFIG_TRANSLOCO } from './core/services/lingua/transloco-config';
import { TranslocoHttpLoader } from './core/services/lingua/transloco-loader';
import { linguaInterceptor } from './core/services/lingua/lingua-interceptor';
import { LinguaService } from './core/services/lingua/lingua-service';
import { TemaService } from './core/services/tema/tema-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions(),
    ),
    provideHttpClient(withFetch(), withInterceptors([linguaInterceptor])),
    provideTransloco({ config: CONFIG_TRANSLOCO, loader: TranslocoHttpLoader }),
    // Tema applicato e traduzioni scaricate prima del primo render.
    provideAppInitializer(() => {
      inject(TemaService);
      return inject(LinguaService).carica();
    }),
  ],
};

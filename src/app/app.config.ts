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
import { catchError, forkJoin, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/services/auth/auth-interceptor';
import { AuthService } from './core/services/auth/auth-service';
import { ImpostazioniService } from './core/services/impostazioni/impostazioni-service';
import { CONFIG_TRANSLOCO } from './core/services/lingua/transloco-config';
import { TranslocoHttpLoader } from './core/services/lingua/transloco-loader';
import { erroriFileInterceptor } from './core/services/errori/errori-file-interceptor';
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
    provideHttpClient(
      withFetch(),
      withInterceptors([linguaInterceptor, authInterceptor, erroriFileInterceptor]),
    ),
    provideTransloco({ config: CONFIG_TRANSLOCO, loader: TranslocoHttpLoader }),
    // Prima del primo render: tema applicato, traduzioni scaricate, sessione ripristinata
    // e impostazioni pubbliche lette (se il backend non risponde il sito parte lo stesso).
    provideAppInitializer(() => {
      inject(TemaService);
      return forkJoin([
        inject(LinguaService).carica(),
        inject(AuthService).ripristina(),
        inject(ImpostazioniService)
          .leggiPubbliche()
          .pipe(catchError(() => of({}))),
      ]);
    }),
  ],
};

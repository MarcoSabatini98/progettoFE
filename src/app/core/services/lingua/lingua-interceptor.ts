import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { LinguaService } from './lingua-service';

/**
 * Aggiunge ?lingua= alle chiamate verso l'API, che risponde con i contenuti tradotti.
 * Le altre richieste (es. i file di traduzione) passano invariate.
 */
export const linguaInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const lingua = inject(LinguaService).attiva();
  return next(req.clone({ setParams: { lingua } }));
};

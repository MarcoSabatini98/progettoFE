import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { SENZA_LINGUA_AUTOMATICA } from './lingua-costanti';
import { LinguaService } from './lingua-service';

/**
 * Aggiunge ?lingua= alle chiamate verso l'API, che risponde con i contenuti tradotti.
 * Le altre richieste (es. i file di traduzione) e quelle marcate SENZA_LINGUA_AUTOMATICA
 * passano invariate.
 */
export const linguaInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl) || req.context.get(SENZA_LINGUA_AUTOMATICA)) {
    return next(req);
  }

  const lingua = inject(LinguaService).attiva();
  return next(req.clone({ setParams: { lingua } }));
};

import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { LinguaService } from '../../services/lingua/lingua-service';

/** Aggiunge ?lingua= alle chiamate verso l'API, che risponde con i contenuti tradotti. */
export const linguaInterceptor: HttpInterceptorFn = (richiesta, prossimo) => {
  if (!richiesta.url.startsWith(environment.apiUrl)) return prossimo(richiesta);
  const lingua = inject(LinguaService).attiva();
  return prossimo(richiesta.clone({ setParams: { lingua } }));
};

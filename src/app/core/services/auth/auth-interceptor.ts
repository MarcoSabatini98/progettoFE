import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { RispostaErroreApiInterface } from '../../../shared/models/errore-api/errore-api-model';
import { CODICI_DA_RINNOVARE } from './auth-costanti';
import { AuthService } from './auth-service';

const URL_AUTH = `${environment.apiUrl}/auth/`;
const URL_RINNOVO = `${URL_AUTH}rinnovo`;

/**
 * Chiamate verso l'API: aggiunge il Bearer token e, per /auth, il cookie del refresh token.
 * Un 401 per token scaduto, con la sessione aperta, rinnova il token una volta e ripete la
 * richiesta. Gli altri 401 (es. password sbagliata) arrivano così come sono.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const conToken = () => {
    const token = auth.token();
    return req.clone({
      withCredentials: req.url.startsWith(URL_AUTH),
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });
  };

  return next(conToken()).pipe(
    catchError((errore: unknown) => {
      if (!(tokenDaRinnovare(errore) && req.url !== URL_RINNOVO && auth.collegato())) {
        return throwError(() => errore);
      }
      return auth.rinnova().pipe(
        catchError(() => throwError(() => errore)),
        switchMap(() => next(conToken())),
      );
    }),
  );
};

function tokenDaRinnovare(errore: unknown): boolean {
  if (!(errore instanceof HttpErrorResponse) || errore.status !== HttpStatusCode.Unauthorized) {
    return false;
  }
  const codice = (errore.error as RispostaErroreApiInterface | null)?.errore?.codice ?? '';
  return CODICI_DA_RINNOVARE.includes(codice);
}

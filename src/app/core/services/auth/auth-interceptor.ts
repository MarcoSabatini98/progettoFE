import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { RispostaErroreApiInterface } from '../../../shared/models/errore-api/errore-api-model';
import { CODICI_DA_RINNOVARE, TOKEN_CHAT_NON_VALIDO } from './auth-costanti';
import { AuthService } from './auth-service';

const URL_AUTH = `${environment.apiUrl}/auth/`;
const URL_RINNOVO = `${URL_AUTH}rinnovo`;

/**
 * Chiamate verso l'API: aggiunge il Bearer token e, per /auth, il cookie del refresh token.
 * Un 401 per token scaduto, con la sessione aperta, rinnova il token una volta e ripete la
 * richiesta. Un token del visitatore non più valido si dimentica. Gli altri 401
 * (es. password sbagliata) arrivano così come sono.
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
      if (codiceDelRifiuto(errore) === TOKEN_CHAT_NON_VALIDO) {
        auth.dimenticaTokenChat();
      }
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
  return CODICI_DA_RINNOVARE.includes(codiceDelRifiuto(errore));
}

/** Codice di un 401 dell'API, '' per ogni altro errore. */
function codiceDelRifiuto(errore: unknown): string {
  if (!(errore instanceof HttpErrorResponse) || errore.status !== HttpStatusCode.Unauthorized) {
    return '';
  }
  return (errore.error as RispostaErroreApiInterface | null)?.errore?.codice ?? '';
}

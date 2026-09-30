import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthService } from './auth-service';

const URL_AUTH = `${environment.apiUrl}/auth/`;
const URL_RINNOVO = `${URL_AUTH}rinnovo`;

/**
 * Chiamate verso l'API: aggiunge il Bearer token e, per /auth, il cookie del refresh token.
 * Un 401 con la sessione aperta rinnova il token una volta e ripete la richiesta.
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
      const daRinnovare =
        errore instanceof HttpErrorResponse &&
        errore.status === HttpStatusCode.Unauthorized &&
        req.url !== URL_RINNOVO &&
        auth.collegato();
      if (!daRinnovare) {
        return throwError(() => errore);
      }
      return auth.rinnova().pipe(
        catchError(() => throwError(() => errore)),
        switchMap(() => next(conToken())),
      );
    }),
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, from, map, switchMap, throwError } from 'rxjs';

/**
 * Le chiamate che scaricano file (responseType blob) ricevono anche l'errore come Blob:
 * se è il JSON del backend lo rilegge come oggetto, così ErroriService ne trova codice e messaggio.
 */
export const erroriFileInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((errore: unknown) =>
      errore instanceof HttpErrorResponse && jsonInBlob(errore.error)
        ? from(errore.error.text()).pipe(
            map(
              (testo) =>
                new HttpErrorResponse({
                  error: JSON.parse(testo),
                  headers: errore.headers,
                  status: errore.status,
                  statusText: errore.statusText,
                  url: errore.url ?? undefined,
                }),
            ),
            switchMap((leggibile) => throwError(() => leggibile)),
          )
        : throwError(() => errore),
    ),
  );

function jsonInBlob(corpo: unknown): corpo is Blob {
  return corpo instanceof Blob && corpo.type.includes('json');
}

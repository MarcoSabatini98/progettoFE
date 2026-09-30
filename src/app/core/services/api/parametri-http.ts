import { HttpParams } from '@angular/common/http';

type ValoreFiltro = string | number | boolean | readonly (string | number)[] | null | undefined;

/**
 * Filtri → query string. I valori assenti o vuoti non partono;
 * le liste diventano "a,b,c", il formato multi-valore dell'API.
 */
export function creaParametri(filtri: object = {}): HttpParams {
  let parametri = new HttpParams();
  for (const [chiave, valore] of Object.entries(filtri) as [string, ValoreFiltro][]) {
    const testo = Array.isArray(valore) ? valore.join(',') : (valore ?? '');
    if (testo !== '') {
      parametri = parametri.set(chiave, String(testo));
    }
  }
  return parametri;
}

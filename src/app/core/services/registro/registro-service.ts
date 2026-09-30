import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  PaginaInterface,
  ParametriPaginaInterface,
} from '../../../shared/models/pagina/pagina-model';
import {
  FiltriRegistro,
  RegistroAttivitaInterface,
  TabellaRegistro,
} from '../../../shared/models/registro-attivita/registro-attivita-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/**
 * Registro delle modifiche a prenotazioni, pagamenti e fatture: solo per l'admin.
 */
@Injectable({
  providedIn: 'root',
})
export class RegistroService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/registro`;

  /**
   * ELENCO — GET /
   */
  elencaAttivita(
    filtri: FiltriRegistro = {},
  ): Observable<PaginaInterface<RegistroAttivitaInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<RegistroAttivitaInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * STORIA — GET /:tabella/:id
   * Tutte le modifiche di un record.
   */
  leggiStoria(
    tabella: TabellaRegistro,
    id: number,
    parametri: ParametriPaginaInterface = {},
  ): Observable<PaginaInterface<RegistroAttivitaInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<RegistroAttivitaInterface>>>(
        `${this.apiUrl}/${tabella}/${id}`,
        { params: creaParametri(parametri) },
      )
      .pipe(map((res) => res.dati));
  }
}

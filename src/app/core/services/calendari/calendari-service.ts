import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CalendarioEsternoAggiornaPayload,
  CalendarioEsternoCreaPayload,
  CalendarioEsternoInterface,
} from '../../../shared/models/calendario-esterno/calendario-esterno-model';
import {
  ChiusuraAggiornaPayload,
  ChiusuraCreaPayload,
  DataBloccataInterface,
  FiltriChiusure,
} from '../../../shared/models/data-bloccata/data-bloccata-model';
import { EsitoChiusuraInterface } from '../../../shared/models/esito-chiusura/esito-chiusura-model';
import { LinkEsportazioneInterface } from '../../../shared/models/link-esportazione/link-esportazione-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/**
 * Chiusure della struttura e calendari iCal delle OTA (importazione ed esportazione).
 */
@Injectable({
  providedIn: 'root',
})
export class CalendariService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/calendari`;

  // ─── Chiusure ───

  /**
   * CHIUSURE — GET /chiusure
   */
  elencaChiusure(filtri: FiltriChiusure = {}): Observable<DataBloccataInterface[]> {
    return this.http
      .get<RispostaApiInterface<DataBloccataInterface[]>>(`${this.apiUrl}/chiusure`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * BLOCCA — POST /chiusure
   */
  blocca(dati: ChiusuraCreaPayload): Observable<EsitoChiusuraInterface> {
    return this.http
      .post<RispostaApiInterface<EsitoChiusuraInterface>>(`${this.apiUrl}/chiusure`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA CHIUSURA — PATCH /chiusure/:id
   * Solo le chiusure manuali.
   */
  aggiornaChiusura(id: number, dati: ChiusuraAggiornaPayload): Observable<DataBloccataInterface> {
    return this.http
      .patch<RispostaApiInterface<DataBloccataInterface>>(`${this.apiUrl}/chiusure/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * SBLOCCA — DELETE /chiusure/:id
   */
  sblocca(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/chiusure/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Esportazione ───

  /**
   * LINK ESPORTAZIONE — GET /esportazione
   */
  elencaLinkEsportazione(): Observable<LinkEsportazioneInterface[]> {
    return this.http
      .get<RispostaApiInterface<LinkEsportazioneInterface[]>>(`${this.apiUrl}/esportazione`)
      .pipe(map((res) => res.dati));
  }

  // ─── Calendari esterni ───

  /**
   * CALENDARI — GET /esterni
   */
  elencaCalendari(): Observable<CalendarioEsternoInterface[]> {
    return this.http
      .get<RispostaApiInterface<CalendarioEsternoInterface[]>>(`${this.apiUrl}/esterni`)
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA CALENDARIO — POST /esterni
   */
  creaCalendario(dati: CalendarioEsternoCreaPayload): Observable<CalendarioEsternoInterface> {
    return this.http
      .post<RispostaApiInterface<CalendarioEsternoInterface>>(`${this.apiUrl}/esterni`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO CALENDARIO — GET /esterni/:id
   */
  leggiCalendario(id: number): Observable<CalendarioEsternoInterface> {
    return this.http
      .get<RispostaApiInterface<CalendarioEsternoInterface>>(`${this.apiUrl}/esterni/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA CALENDARIO — PATCH /esterni/:id
   */
  aggiornaCalendario(
    id: number,
    dati: CalendarioEsternoAggiornaPayload,
  ): Observable<CalendarioEsternoInterface> {
    return this.http
      .patch<RispostaApiInterface<CalendarioEsternoInterface>>(`${this.apiUrl}/esterni/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA CALENDARIO — DELETE /esterni/:id
   */
  eliminaCalendario(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/esterni/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * SINCRONIZZA — POST /esterni/:id/sincronizzazione
   * Restituisce quanti eventi ha letto dal feed.
   */
  sincronizza(id: number): Observable<number> {
    return this.http
      .post<RispostaApiInterface<{ eventi: number }>>(
        `${this.apiUrl}/esterni/${id}/sincronizzazione`,
        null,
      )
      .pipe(map((res) => res.dati.eventi));
  }
}

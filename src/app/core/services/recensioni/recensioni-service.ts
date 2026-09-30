import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import {
  FiltriRecensioni,
  FiltriRecensioniPubbliche,
  RecensioneCreaPayload,
  RecensioneInterface,
  RecensionePerCodicePayload,
  RecensionePubblicaInterface,
  StatoRecensione,
} from '../../../shared/models/recensione/recensione-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { ValutazioniInterface } from '../../../shared/models/valutazioni/valutazioni-model';
import { creaParametri } from '../api/parametri-http';

/** Recensioni dei soggiorni: pubblicazione sul sito, invio dell'ospite e moderazione. */
@Injectable({
  providedIn: 'root',
})
export class RecensioniService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/recensioni`;

  // ─── Sito ───

  /**
   * PUBBLICHE — GET /pubbliche
   */
  elencaPubbliche(
    filtri: FiltriRecensioniPubbliche = {},
  ): Observable<PaginaInterface<RecensionePubblicaInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<RecensionePubblicaInterface>>>(
        `${this.apiUrl}/pubbliche`,
        { params: creaParametri(filtri) },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * VALUTAZIONI — GET /valutazioni
   */
  leggiValutazioni(): Observable<ValutazioniInterface> {
    return this.http
      .get<RispostaApiInterface<ValutazioniInterface>>(`${this.apiUrl}/valutazioni`)
      .pipe(map((res) => res.dati));
  }

  /**
   * RECENSISCI — POST /prenotazione/:id
   */
  creaRecensione(
    prenotazioneId: number,
    dati: RecensioneCreaPayload,
  ): Observable<RecensioneInterface> {
    return this.http
      .post<RispostaApiInterface<RecensioneInterface>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * RECENSISCI PER CODICE — POST /per-codice
   */
  creaRecensionePerCodice(dati: RecensionePerCodicePayload): Observable<RecensioneInterface> {
    return this.http
      .post<RispostaApiInterface<RecensioneInterface>>(`${this.apiUrl}/per-codice`, dati)
      .pipe(map((res) => res.dati));
  }

  // ─── Moderazione ───

  /**
   * ELENCO — GET /
   */
  elencaRecensioni(
    filtri: FiltriRecensioni = {},
  ): Observable<PaginaInterface<RecensioneInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<RecensioneInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO — GET /:id
   */
  leggiRecensione(id: number): Observable<RecensioneInterface> {
    return this.http
      .get<RispostaApiInterface<RecensioneInterface>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * MODERA — PATCH /:id/moderazione
   */
  moderaRecensione(id: number, stato: StatoRecensione): Observable<RecensioneInterface> {
    return this.http
      .patch<RispostaApiInterface<RecensioneInterface>>(`${this.apiUrl}/${id}/moderazione`, {
        stato,
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * RISPONDI — PUT /:id/risposta
   * null toglie la risposta.
   */
  rispondi(id: number, risposta: string | null): Observable<RecensioneInterface> {
    return this.http
      .put<RispostaApiInterface<RecensioneInterface>>(`${this.apiUrl}/${id}/risposta`, {
        risposta,
      })
      .pipe(map((res) => res.dati));
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AnteprimaCancellazioneInterface } from '../../../shared/models/anteprima-cancellazione/anteprima-cancellazione-model';
import {
  CheckinOnlineInterface,
  CheckinOnlinePayload,
} from '../../../shared/models/checkin-online/checkin-online-model';
import { GiornataInterface } from '../../../shared/models/giornata/giornata-model';
import {
  PaginaInterface,
  ParametriPaginaInterface,
} from '../../../shared/models/pagina/pagina-model';
import { ServizioRichiestoPayload } from '../../../shared/models/prenotazione-servizio/prenotazione-servizio-model';
import {
  AccessoPerCodicePayload,
  CancellazionePayload,
  FiltriPrenotazioni,
  PrenotazioneAggiornaPayload,
  PrenotazioneCreaPayload,
  PrenotazioneInterface,
} from '../../../shared/models/prenotazione/prenotazione-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/**
 * Prenotazioni dal sito, dall'area personale e dal gestionale.
 * Con `mia = true` le azioni passano da /mie/:id, riservato al cliente titolare.
 */
@Injectable({
  providedIn: 'root',
})
export class PrenotazioniService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/prenotazioni`;

  // ─── Sito ───

  /**
   * CREA — POST /
   * Anche lo staff prenota da qui (telefono, walk-in).
   */
  creaPrenotazione(dati: PrenotazioneCreaPayload): Observable<PrenotazioneInterface> {
    return this.http
      .post<RispostaApiInterface<PrenotazioneInterface>>(this.apiUrl, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ACCESSO PER CODICE — POST /per-codice
   */
  accediPerCodice(dati: AccessoPerCodicePayload): Observable<PrenotazioneInterface> {
    return this.http
      .post<RispostaApiInterface<PrenotazioneInterface>>(`${this.apiUrl}/per-codice`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DATI CHECK-IN ONLINE — GET /checkin-online/:token
   */
  leggiCheckinOnline(token: string): Observable<CheckinOnlineInterface> {
    return this.http
      .get<RispostaApiInterface<CheckinOnlineInterface>>(`${this.apiUrl}/checkin-online/${token}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * CHECK-IN ONLINE — PUT /checkin-online/:token
   */
  inviaCheckinOnline(
    token: string,
    dati: CheckinOnlinePayload,
  ): Observable<CheckinOnlineInterface> {
    return this.http
      .put<RispostaApiInterface<CheckinOnlineInterface>>(
        `${this.apiUrl}/checkin-online/${token}`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  // ─── Elenchi ───

  /**
   * MIE — GET /mie
   */
  elencaMie(
    filtri: ParametriPaginaInterface = {},
  ): Observable<PaginaInterface<PrenotazioneInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<PrenotazioneInterface>>>(`${this.apiUrl}/mie`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * ELENCO — GET /
   */
  elencaPrenotazioni(
    filtri: FiltriPrenotazioni = {},
  ): Observable<PaginaInterface<PrenotazioneInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<PrenotazioneInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * GIORNATA — GET /giornata
   * Senza giorno: oggi.
   */
  leggiGiornata(giorno?: string): Observable<GiornataInterface> {
    return this.http
      .get<RispostaApiInterface<GiornataInterface>>(`${this.apiUrl}/giornata`, {
        params: creaParametri({ giorno }),
      })
      .pipe(map((res) => res.dati));
  }

  // ─── Cliente e staff ───

  /**
   * DETTAGLIO — GET /:id | /mie/:id
   */
  leggiPrenotazione(id: number, mia = false): Observable<PrenotazioneInterface> {
    return this.http
      .get<RispostaApiInterface<PrenotazioneInterface>>(this.url(id, mia))
      .pipe(map((res) => res.dati));
  }

  /**
   * ANTEPRIMA CANCELLAZIONE — GET /:id/cancellazione | /mie/:id/cancellazione
   */
  anteprimaCancellazione(id: number, mia = false): Observable<AnteprimaCancellazioneInterface> {
    return this.http
      .get<RispostaApiInterface<AnteprimaCancellazioneInterface>>(
        `${this.url(id, mia)}/cancellazione`,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * CANCELLA — POST /:id/cancellazione | /mie/:id/cancellazione
   */
  cancellaPrenotazione(
    id: number,
    dati: CancellazionePayload = {},
    mia = false,
  ): Observable<PrenotazioneInterface> {
    return this.http
      .post<RispostaApiInterface<PrenotazioneInterface>>(`${this.url(id, mia)}/cancellazione`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIUNGI EXTRA — POST /:id/servizi | /mie/:id/servizi
   */
  aggiungiServizio(
    id: number,
    dati: ServizioRichiestoPayload,
    mia = false,
  ): Observable<PrenotazioneInterface> {
    return this.http
      .post<RispostaApiInterface<PrenotazioneInterface>>(`${this.url(id, mia)}/servizi`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * RIMUOVI EXTRA — DELETE /:id/servizi/:servizioId | /mie/:id/servizi/:servizioId
   */
  rimuoviServizio(id: number, servizioId: number, mia = false): Observable<PrenotazioneInterface> {
    return this.http
      .delete<RispostaApiInterface<PrenotazioneInterface>>(
        `${this.url(id, mia)}/servizi/${servizioId}`,
      )
      .pipe(map((res) => res.dati));
  }

  // ─── Staff ───

  /**
   * AGGIORNA — PATCH /:id
   * Date, camera o ospiti ricalcolano il prezzo.
   */
  aggiornaPrenotazione(
    id: number,
    dati: PrenotazioneAggiornaPayload,
  ): Observable<PrenotazioneInterface> {
    return this.http
      .patch<RispostaApiInterface<PrenotazioneInterface>>(this.url(id), dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * CONFERMA — POST /:id/conferma
   */
  confermaPrenotazione(id: number): Observable<PrenotazioneInterface> {
    return this.azione(id, 'conferma');
  }

  /**
   * NO-SHOW — POST /:id/no-show
   */
  segnaNoShow(id: number): Observable<PrenotazioneInterface> {
    return this.azione(id, 'no-show');
  }

  /**
   * CHECK-IN — POST /:id/check-in
   */
  checkIn(id: number): Observable<PrenotazioneInterface> {
    return this.azione(id, 'check-in');
  }

  /**
   * CHECK-OUT — POST /:id/check-out
   * Con `forza` chiude anche con il saldo aperto.
   */
  checkOut(id: number, forza = false): Observable<PrenotazioneInterface> {
    return this.azione(id, 'check-out', { forza });
  }

  /**
   * LINK CHECK-IN — POST /:id/link-checkin
   * Nuovo link a ogni chiamata: quello precedente smette di valere.
   */
  creaLinkCheckin(id: number): Observable<string> {
    return this.http
      .post<RispostaApiInterface<string>>(`${this.url(id)}/link-checkin`, {})
      .pipe(map((res) => res.dati));
  }

  private url(id: number, mia = false): string {
    return mia ? `${this.apiUrl}/mie/${id}` : `${this.apiUrl}/${id}`;
  }

  /** Cambio di stato dello staff: restituisce la prenotazione aggiornata. */
  private azione(id: number, nome: string, dati = {}): Observable<PrenotazioneInterface> {
    return this.http
      .post<RispostaApiInterface<PrenotazioneInterface>>(`${this.url(id)}/${nome}`, dati)
      .pipe(map((res) => res.dati));
  }
}

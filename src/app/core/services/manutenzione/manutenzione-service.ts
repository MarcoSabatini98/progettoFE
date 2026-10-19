import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import {
  FiltriSegnalazioni,
  SegnalazioneAggiornaPayload,
  SegnalazioneCreaPayload,
  SegnalazioneManutenzioneInterface,
} from '../../../shared/models/segnalazione-manutenzione/segnalazione-manutenzione-model';
import { AddettoInterface } from '../../../shared/models/utente/utente-model';
import { creaParametri } from '../api/parametri-http';

/** Segnalazioni di guasti: chiunque dello staff segnala, chi gestisce assegna e chiude. */
@Injectable({
  providedIn: 'root',
})
export class ManutenzioneService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/manutenzione`;

  /**
   * ELENCO — GET /
   */
  elencaSegnalazioni(
    filtri: FiltriSegnalazioni = {},
  ): Observable<PaginaInterface<SegnalazioneManutenzioneInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<SegnalazioneManutenzioneInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * SEGNALA — POST /
   */
  segnala(dati: SegnalazioneCreaPayload): Observable<SegnalazioneManutenzioneInterface> {
    return this.http
      .post<RispostaApiInterface<SegnalazioneManutenzioneInterface>>(this.apiUrl, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * INCARICABILI — GET /incaricabili
   * Lo staff attivo che gestisce la manutenzione, a cui assegnare una segnalazione.
   */
  elencaIncaricabili(): Observable<AddettoInterface[]> {
    return this.http
      .get<RispostaApiInterface<AddettoInterface[]>>(`${this.apiUrl}/incaricabili`)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO — GET /:id
   */
  leggiSegnalazione(id: number): Observable<SegnalazioneManutenzioneInterface> {
    return this.http
      .get<RispostaApiInterface<SegnalazioneManutenzioneInterface>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA — PATCH /:id
   */
  aggiornaSegnalazione(
    id: number,
    dati: SegnalazioneAggiornaPayload,
  ): Observable<SegnalazioneManutenzioneInterface> {
    return this.http
      .patch<RispostaApiInterface<SegnalazioneManutenzioneInterface>>(`${this.apiUrl}/${id}`, dati)
      .pipe(map((res) => res.dati));
  }
}

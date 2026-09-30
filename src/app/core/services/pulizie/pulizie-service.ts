import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  AttivitaPuliziaAggiornaPayload,
  AttivitaPuliziaCreaPayload,
  AttivitaPuliziaInterface,
  AvanzamentoPuliziaPayload,
  FiltriPulizie,
} from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import {
  ChecklistModelloAggiornaPayload,
  ChecklistModelloCreaPayload,
  ChecklistModelloInterface,
} from '../../../shared/models/checklist-modello/checklist-modello-model';
import { EsitoAssegnazionePulizieInterface } from '../../../shared/models/esito-assegnazione-pulizie/esito-assegnazione-pulizie-model';
import { EsitoGiornataPulizieInterface } from '../../../shared/models/esito-giornata-pulizie/esito-giornata-pulizie-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/** Pulizie: checklist, pianificazione della giornata e attività degli addetti. */
@Injectable({
  providedIn: 'root',
})
export class PulizieService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pulizie`;

  // ─── Checklist ───

  /**
   * VOCI — GET /checklist
   */
  elencaVoci(): Observable<ChecklistModelloInterface[]> {
    return this.http
      .get<RispostaApiInterface<ChecklistModelloInterface[]>>(`${this.apiUrl}/checklist`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIUNGI VOCE — POST /checklist
   */
  aggiungiVoce(dati: ChecklistModelloCreaPayload): Observable<ChecklistModelloInterface> {
    return this.http
      .post<RispostaApiInterface<ChecklistModelloInterface>>(`${this.apiUrl}/checklist`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA VOCE — PATCH /checklist/:id
   */
  aggiornaVoce(
    id: number,
    dati: ChecklistModelloAggiornaPayload,
  ): Observable<ChecklistModelloInterface> {
    return this.http
      .patch<RispostaApiInterface<ChecklistModelloInterface>>(
        `${this.apiUrl}/checklist/${id}`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA VOCE — DELETE /checklist/:id
   */
  eliminaVoce(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/checklist/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Giornata ───

  /**
   * GENERA GIORNATA — POST /giornata
   * Senza giorno vale oggi.
   */
  generaGiornata(giorno?: string): Observable<EsitoGiornataPulizieInterface> {
    return this.http
      .post<RispostaApiInterface<EsitoGiornataPulizieInterface>>(`${this.apiUrl}/giornata`, {
        giorno,
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * ASSEGNAZIONE AUTOMATICA — POST /giornata/assegnazione
   */
  assegnaGiornata(giorno?: string): Observable<EsitoAssegnazionePulizieInterface> {
    return this.http
      .post<RispostaApiInterface<EsitoAssegnazionePulizieInterface>>(
        `${this.apiUrl}/giornata/assegnazione`,
        { giorno },
      )
      .pipe(map((res) => res.dati));
  }

  // ─── Attività ───

  /**
   * ELENCO — GET /
   */
  elencaAttivita(filtri: FiltriPulizie = {}): Observable<AttivitaPuliziaInterface[]> {
    return this.http
      .get<RispostaApiInterface<AttivitaPuliziaInterface[]>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA — POST /
   */
  creaAttivita(dati: AttivitaPuliziaCreaPayload): Observable<AttivitaPuliziaInterface> {
    return this.http
      .post<RispostaApiInterface<AttivitaPuliziaInterface>>(this.apiUrl, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO — GET /:id
   */
  leggiAttivita(id: number): Observable<AttivitaPuliziaInterface> {
    return this.http
      .get<RispostaApiInterface<AttivitaPuliziaInterface>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA — PATCH /:id
   */
  aggiornaAttivita(
    id: number,
    dati: AttivitaPuliziaAggiornaPayload,
  ): Observable<AttivitaPuliziaInterface> {
    return this.http
      .patch<RispostaApiInterface<AttivitaPuliziaInterface>>(`${this.apiUrl}/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA — DELETE /:id
   */
  eliminaAttivita(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AVANZA — POST /:id/avanzamento
   * L'addetto avanza solo le proprie attività.
   */
  avanzaAttivita(
    id: number,
    dati: AvanzamentoPuliziaPayload,
  ): Observable<AttivitaPuliziaInterface> {
    return this.http
      .post<RispostaApiInterface<AttivitaPuliziaInterface>>(
        `${this.apiUrl}/${id}/avanzamento`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }
}

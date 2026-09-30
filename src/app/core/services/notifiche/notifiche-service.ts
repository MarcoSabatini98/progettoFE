import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ContatoreNonLetteInterface,
  FiltriNotifiche,
  NotificaInterface,
  NotificheAggiornateInterface,
  PaginaNotificheInterface,
} from '../../../shared/models/notifica/notifica-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/** Notifiche dell'utente: le nuove arrivano dal socket, qui elenco e lettura. */
@Injectable({
  providedIn: 'root',
})
export class NotificheService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifiche`;

  /**
   * ELENCO — GET /
   */
  elencaNotifiche(filtri: FiltriNotifiche = {}): Observable<PaginaNotificheInterface> {
    return this.http
      .get<RispostaApiInterface<PaginaNotificheInterface>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * NON LETTE — GET /non-lette
   */
  contaNonLette(): Observable<number> {
    return this.http
      .get<RispostaApiInterface<ContatoreNonLetteInterface>>(`${this.apiUrl}/non-lette`)
      .pipe(map((res) => res.dati.non_lette));
  }

  /**
   * TUTTE LETTE — POST /lette
   * Restituisce quante notifiche sono cambiate.
   */
  segnaTutteLette(): Observable<number> {
    return this.http
      .post<RispostaApiInterface<NotificheAggiornateInterface>>(`${this.apiUrl}/lette`, {})
      .pipe(map((res) => res.dati.aggiornate));
  }

  /**
   * LETTA — POST /:id/letta
   */
  segnaLetta(id: number): Observable<NotificaInterface> {
    return this.http
      .post<RispostaApiInterface<NotificaInterface>>(`${this.apiUrl}/${id}/letta`, {})
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA — DELETE /:id
   */
  eliminaNotifica(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }
}

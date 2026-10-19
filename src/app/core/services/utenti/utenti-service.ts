import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { DocumentoOspiteInterface } from '../../../shared/models/documento-ospite/documento-ospite-model';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { RuoloInterface } from '../../../shared/models/ruolo/ruolo-model';
import {
  FiltriUtenti,
  PreferenzeEmailInterface,
  ProfiloAggiornaPayload,
  UtenteAggiornaPayload,
  UtenteCreaPayload,
  UtenteInterface,
} from '../../../shared/models/utente/utente-model';
import { creaParametri } from '../api/parametri-http';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root',
})
export class UtentiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/utenti`;

  /**
   * PROFILO — GET /profilo
   */
  leggiProfilo(): Observable<UtenteInterface> {
    return this.http
      .get<RispostaApiInterface<UtenteInterface>>(`${this.apiUrl}/profilo`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA PROFILO — PATCH /profilo
   * Nome e lingua nuovi passano subito anche alla sessione.
   */
  aggiornaProfilo(dati: ProfiloAggiornaPayload): Observable<UtenteInterface> {
    return this.http
      .patch<RispostaApiInterface<UtenteInterface>>(`${this.apiUrl}/profilo`, dati)
      .pipe(
        map((res) => res.dati),
        tap(({ nome, cognome, lingua }) => this.auth.aggiornaUtente({ nome, cognome, lingua })),
      );
  }

  /**
   * PREFERENZE EMAIL — PATCH /profilo/preferenze-email
   */
  aggiornaPreferenzeEmail(
    modifiche: Partial<PreferenzeEmailInterface>,
  ): Observable<PreferenzeEmailInterface> {
    return this.http
      .patch<RispostaApiInterface<PreferenzeEmailInterface>>(
        `${this.apiUrl}/profilo/preferenze-email`,
        modifiche,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * CARICA DOCUMENTO — POST /profilo/documenti
   */
  caricaDocumento(file: File): Observable<DocumentoOspiteInterface> {
    const corpo = new FormData();
    corpo.append('file', file);
    return this.http
      .post<RispostaApiInterface<DocumentoOspiteInterface>>(
        `${this.apiUrl}/profilo/documenti`,
        corpo,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * SCARICA DOCUMENTO — GET /profilo/documenti/:id
   */
  scaricaDocumento(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/profilo/documenti/${id}`, { responseType: 'blob' });
  }

  /**
   * ELIMINA DOCUMENTO — DELETE /profilo/documenti/:id
   */
  eliminaDocumento(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/profilo/documenti/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELENCO — GET /
   */
  elencaUtenti(filtri: FiltriUtenti = {}): Observable<PaginaInterface<UtenteInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<UtenteInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * RUOLI — GET /ruoli
   */
  elencaRuoli(): Observable<RuoloInterface[]> {
    return this.http
      .get<RispostaApiInterface<RuoloInterface[]>>(`${this.apiUrl}/ruoli`)
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA STAFF — POST /
   */
  creaUtente(dati: UtenteCreaPayload): Observable<UtenteInterface> {
    return this.http
      .post<RispostaApiInterface<UtenteInterface>>(this.apiUrl, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO — GET /:id
   */
  leggiUtente(id: number): Observable<UtenteInterface> {
    return this.http
      .get<RispostaApiInterface<UtenteInterface>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA — PATCH /:id
   */
  aggiornaUtente(id: number, dati: UtenteAggiornaPayload): Observable<UtenteInterface> {
    return this.http
      .patch<RispostaApiInterface<UtenteInterface>>(`${this.apiUrl}/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA — DELETE /:id
   */
  eliminaUtente(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }
}

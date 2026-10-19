import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AccessoVisitatoreInterface } from '../../../shared/models/accesso-visitatore/accesso-visitatore-model';
import {
  AssistenzaCreaPayload,
  ChatStaffCreaPayload,
  CollegaInterface,
  ConversazioneInterface,
  FiltriConversazioni,
  StatoConversazione,
} from '../../../shared/models/conversazione/conversazione-model';
import {
  FiltriMessaggi,
  InviaMessaggioPayload,
  MessaggioInterface,
} from '../../../shared/models/messaggio/messaggio-model';
import { NonLettiChatInterface } from '../../../shared/models/non-letti-chat/non-letti-chat-model';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { StatoAssistenzaInterface } from '../../../shared/models/stato-assistenza/stato-assistenza-model';
import { VisitatoreCreaPayload } from '../../../shared/models/visitatore/visitatore-model';
import { creaFormDati } from '../api/form-dati';
import { creaParametri } from '../api/parametri-http';
import { AuthService } from '../auth/auth-service';

/**
 * Chat di assistenza (clienti e visitatori con lo staff) e chat interna dello staff.
 * Il tempo reale passa dal socket: qui solo le chiamate REST.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/chat`;

  // ─── Sito ───

  /**
   * NUOVO VISITATORE — POST /visitatori
   * Conserva il token della chat sul dispositivo.
   */
  creaVisitatore(dati: VisitatoreCreaPayload = {}): Observable<AccessoVisitatoreInterface> {
    return this.http
      .post<RispostaApiInterface<AccessoVisitatoreInterface>>(`${this.apiUrl}/visitatori`, dati)
      .pipe(
        map((res) => res.dati),
        tap((accesso) => this.auth.impostaTokenChat(accesso.token)),
      );
  }

  /**
   * STATO ASSISTENZA — GET /assistenza/stato
   */
  assistenzaDisponibile(): Observable<boolean> {
    return this.http
      .get<RispostaApiInterface<StatoAssistenzaInterface>>(`${this.apiUrl}/assistenza/stato`)
      .pipe(map((res) => res.dati.disponibile));
  }

  // ─── Conversazioni ───

  /**
   * ELENCO — GET /conversazioni
   */
  elencaConversazioni(
    filtri: FiltriConversazioni = {},
  ): Observable<PaginaInterface<ConversazioneInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<ConversazioneInterface>>>(
        `${this.apiUrl}/conversazioni`,
        { params: creaParametri(filtri) },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * NON LETTI — GET /conversazioni/non-letti
   */
  contaNonLetti(): Observable<NonLettiChatInterface> {
    return this.http
      .get<RispostaApiInterface<NonLettiChatInterface>>(`${this.apiUrl}/conversazioni/non-letti`)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO — GET /conversazioni/:uuid
   */
  leggiConversazione(uuid: string): Observable<ConversazioneInterface> {
    return this.http
      .get<RispostaApiInterface<ConversazioneInterface>>(this.url(uuid))
      .pipe(map((res) => res.dati));
  }

  /**
   * APRI ASSISTENZA — POST /conversazioni/assistenza
   */
  apriAssistenza(dati: AssistenzaCreaPayload): Observable<ConversazioneInterface> {
    return this.http
      .post<RispostaApiInterface<ConversazioneInterface>>(
        `${this.apiUrl}/conversazioni/assistenza`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * COLLEGHI — GET /colleghi
   * Lo staff con cui si può aprire una chat interna, con la presenza.
   */
  elencaColleghi(): Observable<CollegaInterface[]> {
    return this.http
      .get<RispostaApiInterface<CollegaInterface[]>>(`${this.apiUrl}/colleghi`)
      .pipe(map((res) => res.dati));
  }

  /**
   * APRI CHAT STAFF — POST /conversazioni/staff
   */
  apriChatStaff(dati: ChatStaffCreaPayload): Observable<ConversazioneInterface> {
    return this.http
      .post<RispostaApiInterface<ConversazioneInterface>>(
        `${this.apiUrl}/conversazioni/staff`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * LETTO — POST /conversazioni/:uuid/letto
   */
  segnaLetto(uuid: string): Observable<null> {
    return this.http
      .post<RispostaApiInterface<null>>(`${this.url(uuid)}/letto`, {})
      .pipe(map((res) => res.dati));
  }

  /**
   * ASSEGNA — PUT /conversazioni/:uuid/assegnatario
   * null = la rimette tra le libere.
   */
  assegna(uuid: string, utenteId: number | null): Observable<ConversazioneInterface> {
    return this.http
      .put<RispostaApiInterface<ConversazioneInterface>>(`${this.url(uuid)}/assegnatario`, {
        utente_id: utenteId,
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * STATO — PATCH /conversazioni/:uuid/stato
   */
  impostaStato(uuid: string, stato: StatoConversazione): Observable<ConversazioneInterface> {
    return this.http
      .patch<RispostaApiInterface<ConversazioneInterface>>(`${this.url(uuid)}/stato`, { stato })
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIUNGI PARTECIPANTE — POST /conversazioni/:uuid/partecipanti
   */
  aggiungiPartecipante(uuid: string, utenteId: number): Observable<ConversazioneInterface> {
    return this.http
      .post<RispostaApiInterface<ConversazioneInterface>>(`${this.url(uuid)}/partecipanti`, {
        utente_id: utenteId,
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * RINOMINA GRUPPO — PATCH /conversazioni/:uuid/titolo
   */
  rinominaGruppo(uuid: string, titolo: string): Observable<ConversazioneInterface> {
    return this.http
      .patch<RispostaApiInterface<ConversazioneInterface>>(`${this.url(uuid)}/titolo`, { titolo })
      .pipe(map((res) => res.dati));
  }

  /**
   * ESCI — POST /conversazioni/:uuid/uscita
   */
  esci(uuid: string): Observable<null> {
    return this.http
      .post<RispostaApiInterface<null>>(`${this.url(uuid)}/uscita`, {})
      .pipe(map((res) => res.dati));
  }

  /**
   * PDF — GET /conversazioni/:uuid/pdf
   */
  esportaPdf(uuid: string): Observable<Blob> {
    return this.http.get(`${this.url(uuid)}/pdf`, { responseType: 'blob' });
  }

  // ─── Messaggi ───

  /**
   * MESSAGGI — GET /conversazioni/:uuid/messaggi
   */
  elencaMessaggi(uuid: string, filtri: FiltriMessaggi = {}): Observable<MessaggioInterface[]> {
    return this.http
      .get<RispostaApiInterface<MessaggioInterface[]>>(`${this.url(uuid)}/messaggi`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * INVIA — POST /conversazioni/:uuid/messaggi (multipart)
   */
  inviaMessaggio(uuid: string, dati: InviaMessaggioPayload): Observable<MessaggioInterface> {
    return this.http
      .post<RispostaApiInterface<MessaggioInterface>>(
        `${this.url(uuid)}/messaggi`,
        creaFormDati(dati),
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * MODIFICA — PATCH /messaggi/:id
   */
  modificaMessaggio(id: number, testo: string): Observable<MessaggioInterface> {
    return this.http
      .patch<RispostaApiInterface<MessaggioInterface>>(`${this.apiUrl}/messaggi/${id}`, { testo })
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA — DELETE /messaggi/:id
   */
  eliminaMessaggio(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/messaggi/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * ALLEGATO — GET /messaggi/:id/allegato
   */
  scaricaAllegato(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/messaggi/${id}/allegato`, { responseType: 'blob' });
  }

  private url(uuid: string): string {
    return `${this.apiUrl}/conversazioni/${uuid}`;
  }
}

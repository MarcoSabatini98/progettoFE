import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  RegistraInvioPayload,
  SoggiornoDaInviareInterface,
} from '../../../shared/models/invio-alloggiati/invio-alloggiati-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { SchedaAlloggiatiInterface } from '../../../shared/models/scheda-alloggiati/scheda-alloggiati-model';

/**
 * Alloggiati Web: schedine degli ospiti, file per il portale ed esiti degli invii.
 */
@Injectable({
  providedIn: 'root',
})
export class AlloggiatiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/alloggiati`;

  /**
   * DA INVIARE — GET /da-inviare
   */
  elencaDaInviare(): Observable<SoggiornoDaInviareInterface[]> {
    return this.http
      .get<RispostaApiInterface<SoggiornoDaInviareInterface[]>>(`${this.apiUrl}/da-inviare`)
      .pipe(map((res) => res.dati));
  }

  /**
   * FILE — POST /file
   * Testo da caricare sul portale; rifiutato se qualche ospite ha dati mancanti.
   */
  scaricaFile(prenotazioni: number[]): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/file`, { prenotazioni }, { responseType: 'blob' });
  }

  /**
   * SCHEDA — GET /prenotazione/:prenotazioneId
   */
  leggiScheda(prenotazioneId: number): Observable<SchedaAlloggiatiInterface> {
    return this.http
      .get<RispostaApiInterface<SchedaAlloggiatiInterface>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}`,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * REGISTRA INVIO — POST /prenotazione/:prenotazioneId/invio
   * Vale per tutti gli ospiti della prenotazione.
   */
  registraInvio(
    prenotazioneId: number,
    dati: RegistraInvioPayload,
  ): Observable<SchedaAlloggiatiInterface> {
    return this.http
      .post<RispostaApiInterface<SchedaAlloggiatiInterface>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}/invio`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }
}

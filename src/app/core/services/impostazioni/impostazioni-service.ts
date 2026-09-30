import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ImpostazioneInterface,
  ImpostazioniAggiornaPayload,
  ImpostazioniPubbliche,
} from '../../../shared/models/impostazione/impostazione-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';

/**
 * Impostazioni della struttura: le pubbliche servono al sito, le altre all'admin.
 */
@Injectable({
  providedIn: 'root',
})
export class ImpostazioniService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/impostazioni`;

  /**
   * PUBBLICHE — GET /pubbliche
   */
  leggiPubbliche(): Observable<ImpostazioniPubbliche> {
    return this.http
      .get<RispostaApiInterface<ImpostazioniPubbliche>>(`${this.apiUrl}/pubbliche`)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELENCO — GET /
   */
  elencaImpostazioni(): Observable<ImpostazioneInterface[]> {
    return this.http
      .get<RispostaApiInterface<ImpostazioneInterface[]>>(this.apiUrl)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA — PATCH /
   * Restituisce l'elenco completo aggiornato.
   */
  aggiornaImpostazioni(dati: ImpostazioniAggiornaPayload): Observable<ImpostazioneInterface[]> {
    return this.http
      .patch<RispostaApiInterface<ImpostazioneInterface[]>>(this.apiUrl, dati)
      .pipe(map((res) => res.dati));
  }
}

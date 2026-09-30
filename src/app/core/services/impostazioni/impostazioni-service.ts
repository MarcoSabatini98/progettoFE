import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ImpostazioneInterface,
  ImpostazioniAggiornaPayload,
  ImpostazioniPubbliche,
} from '../../../shared/models/impostazione/impostazione-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { CHIAVI_IMPOSTAZIONI } from './impostazioni-costanti';

/**
 * Impostazioni della struttura: le pubbliche servono al sito, le altre all'admin.
 */
@Injectable({
  providedIn: 'root',
})
export class ImpostazioniService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/impostazioni`;
  private readonly pubblicheCorrenti = signal<ImpostazioniPubbliche>({});

  /**
   * Impostazioni pubbliche lette all'avvio: nome, contatti, orari, lingue attive.
   */
  readonly pubbliche = this.pubblicheCorrenti.asReadonly();

  /**
   * TESTO
   * Impostazione pubblica come testo; stringa vuota se manca.
   */
  testo(chiave: string): string {
    const valore = this.pubbliche()[chiave];
    return valore === null || valore === undefined ? '' : String(valore);
  }

  /**
   * INDIRIZZO
   * "Via Roma 1, 07100 Sassari (SS)" dalle impostazioni pubbliche: le parti mancanti vengono saltate.
   */
  readonly indirizzo = computed(() => {
    const provincia = this.testo(CHIAVI_IMPOSTAZIONI.provincia);
    const localita = [
      this.testo(CHIAVI_IMPOSTAZIONI.cap),
      this.testo(CHIAVI_IMPOSTAZIONI.comune),
      provincia && `(${provincia})`,
    ]
      .filter(Boolean)
      .join(' ');
    return [this.testo(CHIAVI_IMPOSTAZIONI.indirizzo), localita].filter(Boolean).join(', ');
  });

  /**
   * PUBBLICHE — GET /pubbliche
   * Aggiorna anche il segnale pubbliche.
   */
  leggiPubbliche(): Observable<ImpostazioniPubbliche> {
    return this.http
      .get<RispostaApiInterface<ImpostazioniPubbliche>>(`${this.apiUrl}/pubbliche`)
      .pipe(
        map((res) => res.dati),
        tap((impostazioni) => this.pubblicheCorrenti.set(impostazioni)),
      );
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

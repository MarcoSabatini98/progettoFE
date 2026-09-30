import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { DocumentoOspiteInterface } from '../../../shared/models/documento-ospite/documento-ospite-model';
import {
  FiltriOspiti,
  OspiteAggiornaPayload,
  OspiteCreaPayload,
  OspiteInterface,
} from '../../../shared/models/ospite/ospite-model';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import {
  OspiteSoggiornoInterface,
  RigaOspitePayload,
} from '../../../shared/models/prenotazione-ospite/prenotazione-ospite-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

@Injectable({
  providedIn: 'root',
})
export class OspitiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ospiti`;

  /**
   * OSPITI DEL SOGGIORNO — GET /prenotazione/:prenotazioneId
   */
  elencaOspitiPrenotazione(prenotazioneId: number): Observable<OspiteSoggiornoInterface[]> {
    return this.http
      .get<RispostaApiInterface<OspiteSoggiornoInterface[]>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}`,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * IMPOSTA OSPITI DEL SOGGIORNO — PUT /prenotazione/:prenotazioneId
   * Sostituisce la lista e ricalcola la tassa di soggiorno.
   */
  impostaOspitiPrenotazione(
    prenotazioneId: number,
    ospiti: RigaOspitePayload[],
  ): Observable<OspiteSoggiornoInterface[]> {
    return this.http
      .put<RispostaApiInterface<OspiteSoggiornoInterface[]>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}`,
        { ospiti },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * SCARICA DOCUMENTO — GET /documenti/:documentoId
   */
  scaricaDocumento(documentoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documenti/${documentoId}`, { responseType: 'blob' });
  }

  /**
   * ELIMINA DOCUMENTO — DELETE /documenti/:documentoId
   */
  eliminaDocumento(documentoId: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/documenti/${documentoId}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELENCO — GET /
   */
  elencaOspiti(filtri: FiltriOspiti = {}): Observable<PaginaInterface<OspiteInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<OspiteInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA — POST /
   */
  creaOspite(dati: OspiteCreaPayload): Observable<OspiteInterface> {
    return this.http
      .post<RispostaApiInterface<OspiteInterface>>(this.apiUrl, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * SCHEDA — GET /:id
   */
  leggiOspite(id: number): Observable<OspiteInterface> {
    return this.http
      .get<RispostaApiInterface<OspiteInterface>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA — PATCH /:id
   */
  aggiornaOspite(id: number, dati: OspiteAggiornaPayload): Observable<OspiteInterface> {
    return this.http
      .patch<RispostaApiInterface<OspiteInterface>>(`${this.apiUrl}/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA — DELETE /:id
   */
  eliminaOspite(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * CARICA DOCUMENTO — POST /:id/documenti
   */
  caricaDocumento(id: number, file: File): Observable<DocumentoOspiteInterface> {
    const corpo = new FormData();
    corpo.append('file', file);
    return this.http
      .post<RispostaApiInterface<DocumentoOspiteInterface>>(`${this.apiUrl}/${id}/documenti`, corpo)
      .pipe(map((res) => res.dati));
  }
}

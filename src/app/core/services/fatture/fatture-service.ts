import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  DatiClienteFatturaPayload,
  EsitoSdiPayload,
  FatturaAggiornaPayload,
  FatturaInterface,
  FiltriFatture,
  NotaDiCreditoPayload,
  TipoFileFattura,
} from '../../../shared/models/fattura/fattura-model';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/** Fatture elettroniche: bozze, emissione, note di credito, stato SDI e file. */
@Injectable({
  providedIn: 'root',
})
export class FattureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fatture`;

  // ─── Area personale ───

  /**
   * MIE — GET /mie
   */
  elencaMie(): Observable<FatturaInterface[]> {
    return this.http
      .get<RispostaApiInterface<FatturaInterface[]>>(`${this.apiUrl}/mie`)
      .pipe(map((res) => res.dati));
  }

  /**
   * SCARICA — GET /:id/file | /mie/:id/file
   */
  scaricaFile(id: number, tipo: TipoFileFattura = 'pdf', mia = false): Observable<Blob> {
    const url = mia ? `${this.apiUrl}/mie/${id}/file` : `${this.apiUrl}/${id}/file`;
    return this.http.get(url, { params: creaParametri({ tipo }), responseType: 'blob' });
  }

  // ─── Staff ───

  /**
   * ELENCO — GET /
   */
  elencaFatture(filtri: FiltriFatture = {}): Observable<PaginaInterface<FatturaInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<FatturaInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * BOZZA DA PRENOTAZIONE — POST /prenotazione/:id
   * Senza cliente intesta al titolare.
   */
  creaBozza(
    prenotazioneId: number,
    cliente?: DatiClienteFatturaPayload,
  ): Observable<FatturaInterface> {
    return this.http
      .post<RispostaApiInterface<FatturaInterface>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}`,
        { cliente },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO — GET /:id
   */
  leggiFattura(id: number): Observable<FatturaInterface> {
    return this.http
      .get<RispostaApiInterface<FatturaInterface>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA BOZZA — PATCH /:id
   */
  aggiornaBozza(id: number, dati: FatturaAggiornaPayload): Observable<FatturaInterface> {
    return this.http
      .patch<RispostaApiInterface<FatturaInterface>>(`${this.apiUrl}/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA BOZZA — DELETE /:id
   */
  eliminaBozza(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * EMETTI — POST /:id/emissione
   * Assegna anno e numero e genera XML e PDF.
   */
  emettiFattura(id: number): Observable<FatturaInterface> {
    return this.http
      .post<RispostaApiInterface<FatturaInterface>>(`${this.apiUrl}/${id}/emissione`, {})
      .pipe(map((res) => res.dati));
  }

  /**
   * NOTA DI CREDITO — POST /:id/nota-di-credito
   */
  creaNotaDiCredito(id: number, dati: NotaDiCreditoPayload = {}): Observable<FatturaInterface> {
    return this.http
      .post<RispostaApiInterface<FatturaInterface>>(`${this.apiUrl}/${id}/nota-di-credito`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * STATO SDI — PATCH /:id/sdi
   */
  aggiornaSdi(id: number, dati: EsitoSdiPayload): Observable<FatturaInterface> {
    return this.http
      .patch<RispostaApiInterface<FatturaInterface>>(`${this.apiUrl}/${id}/sdi`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * RIGENERA FILE — POST /:id/file
   */
  rigeneraFile(id: number): Observable<FatturaInterface> {
    return this.http
      .post<RispostaApiInterface<FatturaInterface>>(`${this.apiUrl}/${id}/file`, {})
      .pipe(map((res) => res.dati));
  }
}

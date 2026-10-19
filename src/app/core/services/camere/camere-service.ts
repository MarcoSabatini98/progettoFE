import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CameraAggiornaPayload,
  CameraCreaPayload,
  CameraInterface,
  FiltriCamere,
} from '../../../shared/models/camera/camera-model';
import { PeriodoInterface } from '../../../shared/models/periodo/periodo-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import {
  FiltriServizi,
  ServizioAggiornaPayload,
  ServizioCreaPayload,
  ServizioInterface,
} from '../../../shared/models/servizio/servizio-model';
import { SituazioneCameraInterface } from '../../../shared/models/situazione-camera/situazione-camera-model';
import {
  FiltriTipologie,
  TipologiaAggiornaPayload,
  TipologiaCameraInterface,
  TipologiaCreaPayload,
} from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { creaParametri } from '../api/parametri-http';

/** Tipologie, camere e servizi: il sito legge le pubbliche, lo staff gestisce il resto. */
@Injectable({
  providedIn: 'root',
})
export class CamereService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/camere`;

  // ─── Sito pubblico ───

  /**
   * TIPOLOGIE DEL SITO — GET /sito/tipologie
   */
  elencaTipologiePubbliche(): Observable<TipologiaCameraInterface[]> {
    return this.http
      .get<RispostaApiInterface<TipologiaCameraInterface[]>>(`${this.apiUrl}/sito/tipologie`)
      .pipe(map((res) => res.dati));
  }

  /**
   * TIPOLOGIA DEL SITO — GET /sito/tipologie/:slug
   */
  leggiTipologiaPubblica(slug: string): Observable<TipologiaCameraInterface> {
    return this.http
      .get<RispostaApiInterface<TipologiaCameraInterface>>(`${this.apiUrl}/sito/tipologie/${slug}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * EXTRA DEL SITO — GET /sito/extra
   */
  elencaExtraPubblici(): Observable<ServizioInterface[]> {
    return this.http
      .get<RispostaApiInterface<ServizioInterface[]>>(`${this.apiUrl}/sito/extra`)
      .pipe(map((res) => res.dati));
  }

  // ─── Tipologie ───

  /**
   * ELENCO TIPOLOGIE — GET /tipologie
   */
  elencaTipologie(filtri: FiltriTipologie = {}): Observable<TipologiaCameraInterface[]> {
    return this.http
      .get<RispostaApiInterface<TipologiaCameraInterface[]>>(`${this.apiUrl}/tipologie`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA TIPOLOGIA — POST /tipologie
   */
  creaTipologia(dati: TipologiaCreaPayload): Observable<TipologiaCameraInterface> {
    return this.http
      .post<RispostaApiInterface<TipologiaCameraInterface>>(`${this.apiUrl}/tipologie`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO TIPOLOGIA — GET /tipologie/:id
   */
  leggiTipologia(id: number): Observable<TipologiaCameraInterface> {
    return this.http
      .get<RispostaApiInterface<TipologiaCameraInterface>>(`${this.apiUrl}/tipologie/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA TIPOLOGIA — PATCH /tipologie/:id
   */
  aggiornaTipologia(
    id: number,
    dati: TipologiaAggiornaPayload,
  ): Observable<TipologiaCameraInterface> {
    return this.http
      .patch<RispostaApiInterface<TipologiaCameraInterface>>(`${this.apiUrl}/tipologie/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA TIPOLOGIA — DELETE /tipologie/:id
   */
  eliminaTipologia(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/tipologie/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Servizi ───

  /**
   * ELENCO SERVIZI — GET /servizi
   */
  elencaServizi(filtri: FiltriServizi = {}): Observable<ServizioInterface[]> {
    return this.http
      .get<RispostaApiInterface<ServizioInterface[]>>(`${this.apiUrl}/servizi`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA SERVIZIO — POST /servizi
   */
  creaServizio(dati: ServizioCreaPayload): Observable<ServizioInterface> {
    return this.http
      .post<RispostaApiInterface<ServizioInterface>>(`${this.apiUrl}/servizi`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO SERVIZIO — GET /servizi/:id
   */
  leggiServizio(id: number): Observable<ServizioInterface> {
    return this.http
      .get<RispostaApiInterface<ServizioInterface>>(`${this.apiUrl}/servizi/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA SERVIZIO — PATCH /servizi/:id
   */
  aggiornaServizio(id: number, dati: ServizioAggiornaPayload): Observable<ServizioInterface> {
    return this.http
      .patch<RispostaApiInterface<ServizioInterface>>(`${this.apiUrl}/servizi/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA SERVIZIO — DELETE /servizi/:id
   */
  eliminaServizio(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/servizi/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Camere ───

  /**
   * STATO CAMERE — GET /stato
   * Situazione di oggi: chi c'è, chi arriva, chi parte, pulizia.
   */
  leggiStatoCamere(): Observable<SituazioneCameraInterface[]> {
    return this.http
      .get<RispostaApiInterface<SituazioneCameraInterface[]>>(`${this.apiUrl}/stato`)
      .pipe(map((res) => res.dati));
  }

  /**
   * PLANNING — GET /planning
   * Ogni camera con soggiorni e chiusure del periodo.
   */
  leggiPlanning(periodo: PeriodoInterface): Observable<CameraInterface[]> {
    return this.http
      .get<RispostaApiInterface<CameraInterface[]>>(`${this.apiUrl}/planning`, {
        params: creaParametri(periodo),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * ELENCO — GET /
   */
  elencaCamere(filtri: FiltriCamere = {}): Observable<CameraInterface[]> {
    return this.http
      .get<RispostaApiInterface<CameraInterface[]>>(this.apiUrl, { params: creaParametri(filtri) })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA — POST /
   */
  creaCamera(dati: CameraCreaPayload): Observable<CameraInterface> {
    return this.http
      .post<RispostaApiInterface<CameraInterface>>(this.apiUrl, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO — GET /:id
   */
  leggiCamera(id: number): Observable<CameraInterface> {
    return this.http
      .get<RispostaApiInterface<CameraInterface>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA — PATCH /:id
   */
  aggiornaCamera(id: number, dati: CameraAggiornaPayload): Observable<CameraInterface> {
    return this.http
      .patch<RispostaApiInterface<CameraInterface>>(`${this.apiUrl}/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA — DELETE /:id
   */
  eliminaCamera(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * NUOVO LINK ICAL — POST /:id/token-ical
   * Il vecchio link smette di funzionare: va ridato alle OTA.
   */
  rigeneraTokenIcal(id: number): Observable<CameraInterface> {
    return this.http
      .post<RispostaApiInterface<CameraInterface>>(`${this.apiUrl}/${id}/token-ical`, null)
      .pipe(map((res) => res.dati));
  }
}

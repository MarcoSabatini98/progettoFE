import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CruscottoInterface } from '../../../shared/models/cruscotto/cruscotto-model';
import { IncassoMensileInterface } from '../../../shared/models/incasso-mensile/incasso-mensile-model';
import { FiltriPeriodo } from '../../../shared/models/periodo/periodo-model';
import { ReportOccupazioneInterface } from '../../../shared/models/report-occupazione/report-occupazione-model';
import { ReportRicaviInterface } from '../../../shared/models/report-ricavi/report-ricavi-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { StatisticaCanaleInterface } from '../../../shared/models/statistica-canale/statistica-canale-model';
import {
  FiltriSuggerimenti,
  SuggerimentoPrezzoInterface,
} from '../../../shared/models/suggerimento-prezzo/suggerimento-prezzo-model';
import { TassaSoggiornoMensileInterface } from '../../../shared/models/tassa-soggiorno-mensile/tassa-soggiorno-mensile-model';
import { creaParametri } from '../api/parametri-http';

/**
 * Numeri della struttura. Senza periodo valgono gli ultimi 30 giorni, senza anno quello in corso.
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/analytics`;

  /**
   * CRUSCOTTO — GET /cruscotto
   */
  leggiCruscotto(): Observable<CruscottoInterface> {
    return this.http
      .get<RispostaApiInterface<CruscottoInterface>>(`${this.apiUrl}/cruscotto`)
      .pipe(map((res) => res.dati));
  }

  // ─── Periodo ───

  /**
   * OCCUPAZIONE — GET /occupazione
   */
  leggiOccupazione(filtri: FiltriPeriodo = {}): Observable<ReportOccupazioneInterface> {
    return this.http
      .get<RispostaApiInterface<ReportOccupazioneInterface>>(`${this.apiUrl}/occupazione`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * RICAVI — GET /ricavi
   */
  leggiRicavi(filtri: FiltriPeriodo = {}): Observable<ReportRicaviInterface> {
    return this.http
      .get<RispostaApiInterface<ReportRicaviInterface>>(`${this.apiUrl}/ricavi`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CANALI — GET /canali
   */
  elencaCanali(filtri: FiltriPeriodo = {}): Observable<StatisticaCanaleInterface[]> {
    return this.http
      .get<RispostaApiInterface<StatisticaCanaleInterface[]>>(`${this.apiUrl}/canali`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * SUGGERIMENTI PREZZO — GET /suggerimenti-prezzo
   * Senza periodo i prossimi 30 giorni.
   */
  elencaSuggerimentiPrezzo(
    filtri: FiltriSuggerimenti = {},
  ): Observable<SuggerimentoPrezzoInterface[]> {
    return this.http
      .get<RispostaApiInterface<SuggerimentoPrezzoInterface[]>>(
        `${this.apiUrl}/suggerimenti-prezzo`,
        { params: creaParametri(filtri) },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * REPORT PDF — GET /report
   * Occupazione e ricavi del periodo.
   */
  scaricaReport(filtri: FiltriPeriodo = {}): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/report`, {
      params: creaParametri(filtri),
      responseType: 'blob',
    });
  }

  // ─── Anno ───

  /**
   * INCASSI — GET /incassi
   */
  elencaIncassi(anno?: number): Observable<IncassoMensileInterface[]> {
    return this.http
      .get<RispostaApiInterface<IncassoMensileInterface[]>>(`${this.apiUrl}/incassi`, {
        params: creaParametri({ anno }),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * TASSA DI SOGGIORNO — GET /tassa-soggiorno
   */
  elencaTassaSoggiorno(anno?: number): Observable<TassaSoggiornoMensileInterface[]> {
    return this.http
      .get<RispostaApiInterface<TassaSoggiornoMensileInterface[]>>(
        `${this.apiUrl}/tassa-soggiorno`,
        { params: creaParametri({ anno }) },
      )
      .pipe(map((res) => res.dati));
  }
}

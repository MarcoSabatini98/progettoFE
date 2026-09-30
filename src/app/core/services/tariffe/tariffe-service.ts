import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CodiceScontoAggiornaPayload,
  CodiceScontoCreaPayload,
  CodiceScontoInterface,
  CodiceScontoVerificatoInterface,
  FiltriCodiciSconto,
} from '../../../shared/models/codice-sconto/codice-sconto-model';
import {
  PacchettoAggiornaPayload,
  PacchettoCreaPayload,
  PacchettoInterface,
} from '../../../shared/models/pacchetto/pacchetto-model';
import {
  FiltriPeriodiTariffari,
  PeriodoTariffarioAggiornaPayload,
  PeriodoTariffarioCreaPayload,
  PeriodoTariffarioInterface,
} from '../../../shared/models/periodo-tariffario/periodo-tariffario-model';
import {
  FiltriAttivo,
  PianoAggiornaPayload,
  PianoCreaPayload,
  PianoTariffarioInterface,
} from '../../../shared/models/piano-tariffario/piano-tariffario-model';
import {
  PreventivoInterface,
  PreventivoPayload,
} from '../../../shared/models/preventivo/preventivo-model';
import {
  FiltriPromozioni,
  PromozioneAggiornaPayload,
  PromozioneCreaPayload,
  PromozioneInterface,
} from '../../../shared/models/promozione/promozione-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import {
  TassaAggiornaPayload,
  TassaCreaPayload,
  TassaSoggiornoInterface,
} from '../../../shared/models/tassa-soggiorno/tassa-soggiorno-model';
import { creaParametri } from '../api/parametri-http';

/** Preventivi del sito e listino dello staff: piani, stagioni, sconti, pacchetti e tassa. */
@Injectable({
  providedIn: 'root',
})
export class TariffeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tariffe`;

  // ─── Sito pubblico ───

  /**
   * PREVENTIVO — POST /preventivo
   * Con l'utente collegato comprende lo sconto fedeltà.
   */
  calcolaPreventivo(dati: PreventivoPayload): Observable<PreventivoInterface> {
    return this.http
      .post<RispostaApiInterface<PreventivoInterface>>(`${this.apiUrl}/preventivo`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * VERIFICA CODICE — POST /codici-sconto/verifica
   */
  verificaCodiceSconto(codice: string): Observable<CodiceScontoVerificatoInterface> {
    return this.http
      .post<RispostaApiInterface<CodiceScontoVerificatoInterface>>(
        `${this.apiUrl}/codici-sconto/verifica`,
        { codice },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * PROMOZIONI DEL SITO — GET /promozioni/pubbliche
   */
  elencaPromozioniPubbliche(): Observable<PromozioneInterface[]> {
    return this.http
      .get<RispostaApiInterface<PromozioneInterface[]>>(`${this.apiUrl}/promozioni/pubbliche`)
      .pipe(map((res) => res.dati));
  }

  /**
   * PACCHETTI DEL SITO — GET /pacchetti/pubblici
   */
  elencaPacchettiPubblici(): Observable<PacchettoInterface[]> {
    return this.http
      .get<RispostaApiInterface<PacchettoInterface[]>>(`${this.apiUrl}/pacchetti/pubblici`)
      .pipe(map((res) => res.dati));
  }

  // ─── Piani tariffari ───

  /**
   * ELENCO PIANI — GET /piani
   */
  elencaPiani(filtri: FiltriAttivo = {}): Observable<PianoTariffarioInterface[]> {
    return this.http
      .get<RispostaApiInterface<PianoTariffarioInterface[]>>(`${this.apiUrl}/piani`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA PIANO — POST /piani
   */
  creaPiano(dati: PianoCreaPayload): Observable<PianoTariffarioInterface> {
    return this.http
      .post<RispostaApiInterface<PianoTariffarioInterface>>(`${this.apiUrl}/piani`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO PIANO — GET /piani/:id
   */
  leggiPiano(id: number): Observable<PianoTariffarioInterface> {
    return this.http
      .get<RispostaApiInterface<PianoTariffarioInterface>>(`${this.apiUrl}/piani/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA PIANO — PATCH /piani/:id
   */
  aggiornaPiano(id: number, dati: PianoAggiornaPayload): Observable<PianoTariffarioInterface> {
    return this.http
      .patch<RispostaApiInterface<PianoTariffarioInterface>>(`${this.apiUrl}/piani/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA PIANO — DELETE /piani/:id
   */
  eliminaPiano(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/piani/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Periodi tariffari ───

  /**
   * ELENCO PERIODI — GET /periodi
   */
  elencaPeriodi(filtri: FiltriPeriodiTariffari = {}): Observable<PeriodoTariffarioInterface[]> {
    return this.http
      .get<RispostaApiInterface<PeriodoTariffarioInterface[]>>(`${this.apiUrl}/periodi`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA PERIODO — POST /periodi
   */
  creaPeriodo(dati: PeriodoTariffarioCreaPayload): Observable<PeriodoTariffarioInterface> {
    return this.http
      .post<RispostaApiInterface<PeriodoTariffarioInterface>>(`${this.apiUrl}/periodi`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO PERIODO — GET /periodi/:id
   */
  leggiPeriodo(id: number): Observable<PeriodoTariffarioInterface> {
    return this.http
      .get<RispostaApiInterface<PeriodoTariffarioInterface>>(`${this.apiUrl}/periodi/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA PERIODO — PATCH /periodi/:id
   */
  aggiornaPeriodo(
    id: number,
    dati: PeriodoTariffarioAggiornaPayload,
  ): Observable<PeriodoTariffarioInterface> {
    return this.http
      .patch<RispostaApiInterface<PeriodoTariffarioInterface>>(`${this.apiUrl}/periodi/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA PERIODO — DELETE /periodi/:id
   */
  eliminaPeriodo(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/periodi/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Promozioni ───

  /**
   * ELENCO PROMOZIONI — GET /promozioni
   */
  elencaPromozioni(filtri: FiltriPromozioni = {}): Observable<PromozioneInterface[]> {
    return this.http
      .get<RispostaApiInterface<PromozioneInterface[]>>(`${this.apiUrl}/promozioni`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA PROMOZIONE — POST /promozioni
   */
  creaPromozione(dati: PromozioneCreaPayload): Observable<PromozioneInterface> {
    return this.http
      .post<RispostaApiInterface<PromozioneInterface>>(`${this.apiUrl}/promozioni`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO PROMOZIONE — GET /promozioni/:id
   */
  leggiPromozione(id: number): Observable<PromozioneInterface> {
    return this.http
      .get<RispostaApiInterface<PromozioneInterface>>(`${this.apiUrl}/promozioni/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA PROMOZIONE — PATCH /promozioni/:id
   */
  aggiornaPromozione(id: number, dati: PromozioneAggiornaPayload): Observable<PromozioneInterface> {
    return this.http
      .patch<RispostaApiInterface<PromozioneInterface>>(`${this.apiUrl}/promozioni/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA PROMOZIONE — DELETE /promozioni/:id
   */
  eliminaPromozione(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/promozioni/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Codici sconto ───

  /**
   * ELENCO CODICI — GET /codici-sconto
   */
  elencaCodiciSconto(filtri: FiltriCodiciSconto = {}): Observable<CodiceScontoInterface[]> {
    return this.http
      .get<RispostaApiInterface<CodiceScontoInterface[]>>(`${this.apiUrl}/codici-sconto`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA CODICE — POST /codici-sconto
   */
  creaCodiceSconto(dati: CodiceScontoCreaPayload): Observable<CodiceScontoInterface> {
    return this.http
      .post<RispostaApiInterface<CodiceScontoInterface>>(`${this.apiUrl}/codici-sconto`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO CODICE — GET /codici-sconto/:id
   */
  leggiCodiceSconto(id: number): Observable<CodiceScontoInterface> {
    return this.http
      .get<RispostaApiInterface<CodiceScontoInterface>>(`${this.apiUrl}/codici-sconto/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA CODICE — PATCH /codici-sconto/:id
   */
  aggiornaCodiceSconto(
    id: number,
    dati: CodiceScontoAggiornaPayload,
  ): Observable<CodiceScontoInterface> {
    return this.http
      .patch<RispostaApiInterface<CodiceScontoInterface>>(
        `${this.apiUrl}/codici-sconto/${id}`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA CODICE — DELETE /codici-sconto/:id
   */
  eliminaCodiceSconto(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/codici-sconto/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Pacchetti ───

  /**
   * ELENCO PACCHETTI — GET /pacchetti
   */
  elencaPacchetti(filtri: FiltriAttivo = {}): Observable<PacchettoInterface[]> {
    return this.http
      .get<RispostaApiInterface<PacchettoInterface[]>>(`${this.apiUrl}/pacchetti`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA PACCHETTO — POST /pacchetti
   */
  creaPacchetto(dati: PacchettoCreaPayload): Observable<PacchettoInterface> {
    return this.http
      .post<RispostaApiInterface<PacchettoInterface>>(`${this.apiUrl}/pacchetti`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO PACCHETTO — GET /pacchetti/:id
   */
  leggiPacchetto(id: number): Observable<PacchettoInterface> {
    return this.http
      .get<RispostaApiInterface<PacchettoInterface>>(`${this.apiUrl}/pacchetti/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA PACCHETTO — PATCH /pacchetti/:id
   */
  aggiornaPacchetto(id: number, dati: PacchettoAggiornaPayload): Observable<PacchettoInterface> {
    return this.http
      .patch<RispostaApiInterface<PacchettoInterface>>(`${this.apiUrl}/pacchetti/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA PACCHETTO — DELETE /pacchetti/:id
   */
  eliminaPacchetto(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/pacchetti/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Tassa di soggiorno ───

  /**
   * ELENCO TASSE — GET /tasse
   */
  elencaTasse(): Observable<TassaSoggiornoInterface[]> {
    return this.http
      .get<RispostaApiInterface<TassaSoggiornoInterface[]>>(`${this.apiUrl}/tasse`)
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA TASSA — POST /tasse
   */
  creaTassa(dati: TassaCreaPayload): Observable<TassaSoggiornoInterface> {
    return this.http
      .post<RispostaApiInterface<TassaSoggiornoInterface>>(`${this.apiUrl}/tasse`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO TASSA — GET /tasse/:id
   */
  leggiTassa(id: number): Observable<TassaSoggiornoInterface> {
    return this.http
      .get<RispostaApiInterface<TassaSoggiornoInterface>>(`${this.apiUrl}/tasse/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA TASSA — PATCH /tasse/:id
   */
  aggiornaTassa(id: number, dati: TassaAggiornaPayload): Observable<TassaSoggiornoInterface> {
    return this.http
      .patch<RispostaApiInterface<TassaSoggiornoInterface>>(`${this.apiUrl}/tasse/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA TASSA — DELETE /tasse/:id
   */
  eliminaTassa(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/tasse/${id}`)
      .pipe(map((res) => res.dati));
  }
}

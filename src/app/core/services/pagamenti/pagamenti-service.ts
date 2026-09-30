import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CheckoutInterface } from '../../../shared/models/checkout/checkout-model';
import {
  AvviaOnlinePayload,
  FiltriPagamenti,
  PagamentoInterface,
  PagaPerCodicePayload,
  RegistraPagamentoPayload,
  RimborsoPayload,
} from '../../../shared/models/pagamento/pagamento-model';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import { AccessoPerCodicePayload } from '../../../shared/models/prenotazione/prenotazione-model';
import { RiepilogoPagamentoInterface } from '../../../shared/models/riepilogo-pagamento/riepilogo-pagamento-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/**
 * Pagamenti online (Stripe, PayPal), incassi in struttura e rimborsi.
 * Con `mia = true` riepilogo e pagamento passano da /mie/:id, riservato al cliente titolare.
 */
@Injectable({
  providedIn: 'root',
})
export class PagamentiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pagamenti`;

  // ─── Cliente e staff ───

  /**
   * RIEPILOGO — GET /prenotazione/:id/riepilogo | /mie/:id
   */
  leggiRiepilogo(prenotazioneId: number, mia = false): Observable<RiepilogoPagamentoInterface> {
    const url = mia
      ? `${this.apiUrl}/mie/${prenotazioneId}`
      : `${this.apiUrl}/prenotazione/${prenotazioneId}/riepilogo`;
    return this.http
      .get<RispostaApiInterface<RiepilogoPagamentoInterface>>(url)
      .pipe(map((res) => res.dati));
  }

  /**
   * PAGA ONLINE — POST /prenotazione/:id/online | /mie/:id
   * invia_email vale solo per lo staff.
   */
  avviaOnline(
    prenotazioneId: number,
    dati: AvviaOnlinePayload,
    mia = false,
  ): Observable<CheckoutInterface> {
    const url = mia
      ? `${this.apiUrl}/mie/${prenotazioneId}`
      : `${this.apiUrl}/prenotazione/${prenotazioneId}/online`;
    return this.http
      .post<RispostaApiInterface<CheckoutInterface>>(url, dati)
      .pipe(map((res) => res.dati));
  }

  // ─── Ospite senza account ───

  /**
   * RIEPILOGO PER CODICE — POST /per-codice
   */
  leggiRiepilogoPerCodice(dati: AccessoPerCodicePayload): Observable<RiepilogoPagamentoInterface> {
    return this.http
      .post<RispostaApiInterface<RiepilogoPagamentoInterface>>(`${this.apiUrl}/per-codice`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * PAGA PER CODICE — POST /per-codice/paga
   */
  pagaPerCodice(dati: PagaPerCodicePayload): Observable<CheckoutInterface> {
    return this.http
      .post<RispostaApiInterface<CheckoutInterface>>(`${this.apiUrl}/per-codice/paga`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * CATTURA PAYPAL — POST /paypal/cattura
   * PayPal rimanda al sito con ?token=<id ordine>.
   */
  catturaPaypal(token: string): Observable<PagamentoInterface> {
    return this.http
      .post<RispostaApiInterface<PagamentoInterface>>(`${this.apiUrl}/paypal/cattura`, { token })
      .pipe(map((res) => res.dati));
  }

  // ─── Staff ───

  /**
   * ELENCO — GET /
   */
  elencaPagamenti(filtri: FiltriPagamenti = {}): Observable<PaginaInterface<PagamentoInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<PagamentoInterface>>>(this.apiUrl, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * DELLA PRENOTAZIONE — GET /prenotazione/:id
   */
  elencaPagamentiPrenotazione(prenotazioneId: number): Observable<PagamentoInterface[]> {
    return this.http
      .get<RispostaApiInterface<PagamentoInterface[]>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}`,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * REGISTRA — POST /prenotazione/:id
   */
  registraPagamento(
    prenotazioneId: number,
    dati: RegistraPagamentoPayload,
  ): Observable<PagamentoInterface> {
    return this.http
      .post<RispostaApiInterface<PagamentoInterface>>(
        `${this.apiUrl}/prenotazione/${prenotazioneId}`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * ANNULLA — POST /:id/annullamento
   */
  annullaPagamento(id: number, motivo: string): Observable<PagamentoInterface> {
    return this.http
      .post<RispostaApiInterface<PagamentoInterface>>(`${this.apiUrl}/${id}/annullamento`, {
        motivo,
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * RIMBORSA — POST /:id/rimborso
   */
  rimborsaPagamento(id: number, dati: RimborsoPayload): Observable<PagamentoInterface> {
    return this.http
      .post<RispostaApiInterface<PagamentoInterface>>(`${this.apiUrl}/${id}/rimborso`, dati)
      .pipe(map((res) => res.dati));
  }
}

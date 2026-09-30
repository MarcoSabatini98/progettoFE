import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';

import { RispostaErroreApiInterface } from '../../../shared/models/errore-api/errore-api-model';
import { ERRORI_LOCALI, PREFISSO_ERRORI, PREFISSO_MODULI } from './errori-costanti';

/**
 * Trasforma errori delle chiamate e dei campi in testi da mostrare, nella lingua del sito.
 */
@Injectable({
  providedIn: 'root',
})
export class ErroriService {
  private readonly transloco = inject(TranslocoService);

  /**
   * MESSAGGIO
   * Traduce il codice del backend (es. errori.CREDENZIALI_NON_VALIDE); se la traduzione
   * manca usa il messaggio italiano del backend.
   */
  messaggio(errore: unknown): string {
    if (errore instanceof HttpErrorResponse && errore.status === 0) {
      return this.traduci(ERRORI_LOCALI.rete);
    }
    const dettaglio =
      errore instanceof HttpErrorResponse
        ? (errore.error as RispostaErroreApiInterface | null)?.errore
        : undefined;
    if (!dettaglio) {
      return this.traduci(ERRORI_LOCALI.generico);
    }
    const tradotto = this.traduci(dettaglio.codice);
    return tradotto === `${PREFISSO_ERRORI}.${dettaglio.codice}` ? dettaglio.messaggio : tradotto;
  }

  /**
   * CAMPO
   * Primo errore di un campo già toccato, tradotto (es. moduli.minlength con requiredLength).
   * Stringa vuota se il campo è valido o l'utente non l'ha ancora toccato.
   */
  campo(controllo: AbstractControl): string {
    const [errore] = Object.entries(controllo.errors ?? {});
    if (!controllo.touched || !errore) {
      return '';
    }
    const [codice, dettaglio] = errore;
    const parametri = typeof dettaglio === 'object' ? dettaglio : {};
    return this.transloco.translate(`${PREFISSO_MODULI}.${codice}`, parametri);
  }

  private traduci(codice: string): string {
    return this.transloco.translate(`${PREFISSO_ERRORI}.${codice}`);
  }
}

import { Pipe, PipeTransform, computed, inject } from '@angular/core';

import {
  CHIAVI_IMPOSTAZIONI,
  VALUTA_PREDEFINITA,
} from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { LinguaService } from '../../core/services/lingua/lingua-service';

/**
 * Importo nella valuta della struttura, scritto come si usa nella lingua del sito:
 * 12000 → "12.000,00 €" in italiano, "€12,000.00" in inglese.
 * Impura perché segue la lingua; il formato si ricrea solo quando lingua o valuta cambiano.
 */
@Pipe({ name: 'prezzo', pure: false })
export class PrezzoPipe implements PipeTransform {
  private readonly lingua = inject(LinguaService);
  private readonly impostazioni = inject(ImpostazioniService);
  private readonly formato = computed(
    () =>
      new Intl.NumberFormat(this.lingua.attiva(), {
        style: 'currency',
        currency: this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.valuta) || VALUTA_PREDEFINITA,
      }),
  );

  /** I DECIMAL del database possono arrivare come testo: "90.00" vale 90. */
  transform(importo: number | string | null | undefined): string {
    return importo === null || importo === undefined ? '' : this.formato().format(Number(importo));
  }
}

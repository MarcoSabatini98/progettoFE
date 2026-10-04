import { Pipe, PipeTransform, computed, inject } from '@angular/core';

import { LinguaService } from '../../core/services/lingua/lingua-service';
import { PrezzoPipe } from './prezzo-pipe';

/**
 * Variazione o sconto del listino: in percentuale ("10%") oppure come importo
 * nella valuta della struttura. Impura come PrezzoPipe, perché segue la lingua.
 */
@Pipe({ name: 'variazione', pure: false })
export class VariazionePipe implements PipeTransform {
  private readonly lingua = inject(LinguaService);
  private readonly prezzo = new PrezzoPipe();
  private readonly percentuale = computed(
    () =>
      new Intl.NumberFormat(this.lingua.attiva(), { style: 'percent', maximumFractionDigits: 2 }),
  );

  /** I DECIMAL del database possono arrivare come testo: "10.00" vale 10. */
  transform(valore: number | string, tipo: string): string {
    return tipo === 'percentuale'
      ? this.percentuale().format(Number(valore) / 100)
      : this.prezzo.transform(valore);
  }
}

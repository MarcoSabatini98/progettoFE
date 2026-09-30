import { Pipe, PipeTransform, computed, inject } from '@angular/core';

import { LinguaService } from '../../core/services/lingua/lingua-service';

/**
 * Voto o media delle recensioni con al massimo un decimale, nella lingua del sito:
 * 4.56 → "4,6" in italiano, "4.6" in inglese. Impura perché segue la lingua.
 */
@Pipe({ name: 'voto', pure: false })
export class VotoPipe implements PipeTransform {
  private readonly lingua = inject(LinguaService);
  private readonly formato = computed(
    () => new Intl.NumberFormat(this.lingua.attiva(), { maximumFractionDigits: 1 }),
  );

  /** Le medie della vista arrivano come testo: "4.50" vale 4,5. */
  transform(voto: number | string | null | undefined): string {
    return voto === null || voto === undefined ? '' : this.formato().format(Number(voto));
  }
}

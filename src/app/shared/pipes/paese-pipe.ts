import { Pipe, PipeTransform, computed, inject } from '@angular/core';

import { LinguaService } from '../../core/services/lingua/lingua-service';

/**
 * Nome del paese dal codice ISO 3166-1 alpha-2, nella lingua del sito: "DE" → "Germania".
 * Impura perché segue la lingua; i nomi si ricreano solo quando la lingua cambia.
 */
@Pipe({ name: 'paese', pure: false })
export class PaesePipe implements PipeTransform {
  private readonly lingua = inject(LinguaService);
  private readonly nomi = computed(
    () => new Intl.DisplayNames(this.lingua.attiva(), { type: 'region' }),
  );

  /** Un codice che il browser non conosce resta com'è. */
  transform(codice: string | null | undefined): string {
    return codice ? (this.nomi().of(codice.toUpperCase()) ?? codice) : '';
  }
}

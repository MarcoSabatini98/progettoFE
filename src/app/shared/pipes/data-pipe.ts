import { Pipe, PipeTransform, computed, inject } from '@angular/core';

import { LinguaService } from '../../core/services/lingua/lingua-service';

/**
 * Formati disponibili: giorno = "3 ottobre 2026", mese = "ottobre 2026",
 * ora = "3 ottobre, 15:30", settimana = "sab 3" (colonne del planning), breve = "3 ott".
 */
const FORMATI_DATA = {
  giorno: { day: 'numeric', month: 'long', year: 'numeric' },
  mese: { month: 'long', year: 'numeric' },
  ora: { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
  settimana: { weekday: 'short', day: 'numeric' },
  breve: { day: 'numeric', month: 'short' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export type FormatoData = keyof typeof FORMATI_DATA;

/** Lunghezza di una data di calendario 'AAAA-MM-GG'. */
const LUNGHEZZA_DATA_CALENDARIO = 10;

/**
 * Data nella lingua del sito, da 'AAAA-MM-GG' o da un istante ISO dell'API.
 * Impura perché segue la lingua; i formati si ricreano solo quando la lingua cambia.
 */
@Pipe({ name: 'data', pure: false })
export class DataPipe implements PipeTransform {
  private readonly lingua = inject(LinguaService);
  private readonly formati = computed(() => {
    const lingua = this.lingua.attiva();
    return Object.fromEntries(
      Object.entries(FORMATI_DATA).map(([nome, opzioni]) => [
        nome,
        new Intl.DateTimeFormat(lingua, opzioni),
      ]),
    ) as Record<FormatoData, Intl.DateTimeFormat>;
  });

  transform(data: string | null | undefined, formato: FormatoData = 'giorno'): string {
    return data ? this.formati()[formato].format(daTesto(data)) : '';
  }
}

/** Una data di calendario va letta a mezzanotte locale: in UTC slitterebbe al giorno prima. */
function daTesto(data: string): Date {
  return new Date(data.length === LUNGHEZZA_DATA_CALENDARIO ? `${data}T00:00` : data);
}

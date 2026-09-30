import { Pipe, PipeTransform } from '@angular/core';

/** Quante iniziali mostrare negli avatar e nel marchio. */
const MASSIMO_INIZIALI = 2;

/**
 * Iniziali maiuscole delle prime parole: "Casa del Mare" → "CD", "Anna Rossi" → "AR".
 */
@Pipe({ name: 'iniziali' })
export class InizialiPipe implements PipeTransform {
  transform(testo: string | null | undefined): string {
    return (testo ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, MASSIMO_INIZIALI)
      .map((parola) => parola.charAt(0).toUpperCase())
      .join('');
  }
}

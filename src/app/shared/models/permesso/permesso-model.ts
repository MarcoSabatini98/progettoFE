import type { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';

/** Codice di un permesso (es. 'prenotazioni.gestisci'). */
export type CodicePermesso = (typeof PERMESSI)[keyof typeof PERMESSI];

export interface PermessoInterface {
  codice: CodicePermesso;
  modulo: string;
  descrizione: string;
}

import type { RUOLI } from '../../../core/services/ruoli/ruoli-costanti';
import { PermessoInterface } from '../permesso/permesso-model';

/** Codice di un ruolo (admin, receptionist, housekeeper_senior, housekeeper, cliente). */
export type CodiceRuolo = (typeof RUOLI)[keyof typeof RUOLI];

export interface RuoloInterface {
  codice: CodiceRuolo;
  nome: string;
  descrizione: string | null;
  staff: boolean;

  // ─── Associazioni ───
  permessi?: PermessoInterface[];
}

import type { RUOLI, RUOLI_ASSEGNABILI } from '../../../core/services/ruoli/ruoli-costanti';
import { PermessoInterface } from '../permesso/permesso-model';

/** Codice di un ruolo (admin, receptionist, housekeeper_senior, housekeeper, cliente). */
export type CodiceRuolo = (typeof RUOLI)[keyof typeof RUOLI];

/** Ruolo che l'admin può dare a un account staff. */
export type RuoloAssegnabile = (typeof RUOLI_ASSEGNABILI)[number];

export interface RuoloInterface {
  codice: CodiceRuolo;
  nome: string;
  descrizione: string | null;
  staff: boolean;

  // ─── Associazioni ───
  permessi?: PermessoInterface[];
}

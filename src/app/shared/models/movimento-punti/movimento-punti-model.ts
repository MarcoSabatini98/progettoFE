import type { MOTIVI_PUNTI } from '../../../core/services/tariffe/tariffe-costanti';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { UtenteInterface } from '../utente/utente-model';

export type MotivoPunti = (typeof MOTIVI_PUNTI)[number];

/** Punti fedeltà guadagnati o tolti (punti negativi). */
export interface MovimentoPuntiInterface {
  id: number;
  utente_id: number;
  prenotazione_id: number | null;
  punti: number;
  motivo: MotivoPunti;
  note: string | null;
  creato_da: number | null;
  creato_il: string;

  // ─── Associazioni ───
  prenotazione?: PrenotazioneInterface | null;
  /** Chi ha assegnato i punti a mano. */
  autore?: UtenteInterface | null;
}

/** Punti negativi per toglierli; motivo 'bonus' se assente. */
export type PuntiPayload = Pick<MovimentoPuntiInterface, 'punti'> &
  Partial<Pick<MovimentoPuntiInterface, 'motivo' | 'note'>>;

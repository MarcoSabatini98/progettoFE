import type { MOTIVI_PUNTI } from '../../../core/services/tariffe/tariffe-costanti';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

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
}

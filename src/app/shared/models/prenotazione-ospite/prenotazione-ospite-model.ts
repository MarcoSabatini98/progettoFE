import type { TIPI_ALLOGGIATO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { OspiteInterface } from '../ospite/ospite-model';

export type TipoAlloggiato = (typeof TIPI_ALLOGGIATO)[number];

/** Ospite di un soggiorno, con il ruolo nella schedina e l'eventuale esenzione dalla tassa. */
export interface PrenotazioneOspiteInterface {
  prenotazione_id: number;
  ospite_id: number;
  tipo_alloggiato: TipoAlloggiato;
  esente_tassa: boolean;
  motivo_esenzione: string | null;

  // ─── Associazioni ───
  ospite?: OspiteInterface;
}

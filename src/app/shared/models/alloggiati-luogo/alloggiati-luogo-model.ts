import type { TIPI_LUOGO } from '../../../core/services/prenotazioni/prenotazioni-costanti';

export type TipoLuogo = (typeof TIPI_LUOGO)[number];

/** Comune o stato estero dalla tabella ufficiale di Alloggiati Web. */
export interface AlloggiatiLuogoInterface {
  codice: string;
  descrizione: string;
  /** Sigla della provincia, solo per i comuni. */
  provincia: string | null;
  tipo: TipoLuogo;
  soppresso_il: string | null;
}

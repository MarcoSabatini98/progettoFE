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

/** Luogo trovato dalla ricerca pubblica: in vigore oggi o alla data chiesta. */
export type LuogoTrovatoInterface = Omit<AlloggiatiLuogoInterface, 'soppresso_il'>;

/**
 * cerca: inizio del nome, almeno 2 lettere.
 * in_vigore_il: AAAA-MM-GG; senza, solo i luoghi in vigore oggi.
 */
export interface FiltriLuoghi {
  cerca: string;
  tipo?: TipoLuogo;
  in_vigore_il?: string;
}

import { LivelloFedeltaInterface } from '../livello-fedelta/livello-fedelta-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';

/** Punti e livello di un cliente (vista v_fedelta_utenti). */
export interface FedeltaUtenteInterface {
  utente_id: number;
  punti_fedelta: number | null;
  livello_id: number | null;
  livello: string | null;
  livello_nome: string | null;
  sconto_percentuale: number | null;
  /** null = già al livello più alto. */
  punti_prossimo_livello: number | null;

  // ─── Associazioni ───
  dettagli_livello?: LivelloFedeltaInterface | null;
}

/** Livello attuale e punti che mancano al successivo (null = già al più alto). */
export interface SituazioneFedeltaInterface extends FedeltaUtenteInterface {
  punti_mancanti: number | null;
}

/** Clienti dai più fedeli. */
export interface FiltriClassificaFedelta extends ParametriPaginaInterface {
  /** Codice del livello. */
  livello?: string;
}

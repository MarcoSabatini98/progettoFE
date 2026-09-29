import { LivelloFedeltaInterface } from '../livello-fedelta/livello-fedelta-model';

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

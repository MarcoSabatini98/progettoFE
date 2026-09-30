import type { TIPI_IMPOSTAZIONE } from '../../../core/services/sistema/sistema-costanti';

export type TipoImpostazione = (typeof TIPI_IMPOSTAZIONE)[number];

/** Valore già convertito dal server in base al tipo; null = numero o json vuoto. */
export type ValoreImpostazione =
  string | number | boolean | unknown[] | Record<string, unknown> | null;

/** Impostazione della struttura. tipo dice come il valore viene salvato. */
export interface ImpostazioneInterface {
  chiave: string;
  valore: ValoreImpostazione;
  tipo: TipoImpostazione;
  gruppo: string;
  descrizione: string | null;
  /** true = visibile anche sul sito pubblico. */
  pubblica: boolean;
  aggiornato_da: number | null;
  aggiornato_il: string;
}

// ─── Payload ───

/** Mappa chiave → nuovo valore. Chiavi inesistenti rifiutate dal server. */
export type ImpostazioniAggiornaPayload = Record<string, Exclude<ValoreImpostazione, null>>;

/** Impostazioni pubbliche del sito: chiave → valore. */
export type ImpostazioniPubbliche = Record<string, ValoreImpostazione>;

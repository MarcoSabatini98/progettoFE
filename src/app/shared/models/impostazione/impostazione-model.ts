import type { TIPI_IMPOSTAZIONE } from '../../../core/services/sistema/sistema-costanti';

export type TipoImpostazione = (typeof TIPI_IMPOSTAZIONE)[number];

/** Impostazione della struttura. valore è sempre testo: tipo dice come leggerlo. */
export interface ImpostazioneInterface {
  chiave: string;
  valore: string;
  tipo: TipoImpostazione;
  gruppo: string;
  descrizione: string | null;
  /** true = visibile anche sul sito pubblico. */
  pubblica: boolean;
  aggiornato_da: number | null;
  aggiornato_il: string;
}

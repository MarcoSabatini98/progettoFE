import type { CALCOLO_PREZZO, TIPI_SERVIZIO } from '../../../core/services/camere/camere-costanti';
import { MediaInterface } from '../media/media-model';

export type TipoServizio = (typeof TIPI_SERVIZIO)[number];
export type CalcoloPrezzo = (typeof CALCOLO_PREZZO)[number];

/** Dotazione della camera (wifi, aria condizionata) o extra acquistabile (colazione, transfer). */
export interface ServizioInterface {
  id: number;
  nome: string;
  descrizione: string | null;
  icona: string | null;
  tipo: TipoServizio;
  prezzo: number;
  calcolo_prezzo: CalcoloPrezzo;
  aliquota_iva: number | null;
  ordine: number;
  attivo: boolean;
  creato_il: string;
  aggiornato_il: string;
  eliminato_il: string | null;

  // ─── Associazioni ───
  media?: MediaInterface[];
}

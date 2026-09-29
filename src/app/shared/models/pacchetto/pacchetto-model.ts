import { MediaInterface } from '../media/media-model';
import { ServizioInterface } from '../servizio/servizio-model';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

/** Servizio incluso nel pacchetto, con la quantità dalla tabella ponte. */
export interface ServizioPacchettoInterface extends ServizioInterface {
  PacchettoServizio: { quantita: number };
}

/** Offerta a prezzo fisso che unisce soggiorno e servizi (es. "Weekend romantico"). */
export interface PacchettoInterface {
  id: number;
  nome: string;
  slug: string;
  descrizione: string | null;
  prezzo: number;
  tipologia_id: number | null;
  notti_min: number | null;
  valido_dal: string | null;
  valido_al: string | null;
  attivo: boolean;
  ordine: number;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  servizi?: ServizioPacchettoInterface[];
  media?: MediaInterface[];
  tipologia?: TipologiaCameraInterface | null;
}

import { MediaInterface } from '../media/media-model';
import { ServizioRichiestoPayload } from '../prenotazione-servizio/prenotazione-servizio-model';
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

export type PacchettoCreaPayload = Pick<PacchettoInterface, 'nome' | 'prezzo'> &
  Partial<
    Pick<
      PacchettoInterface,
      | 'slug'
      | 'descrizione'
      | 'tipologia_id'
      | 'notti_min'
      | 'valido_dal'
      | 'valido_al'
      | 'attivo'
      | 'ordine'
    >
  > & {
    /** Servizi inclusi: sostituiscono quelli attuali. */
    servizi?: ServizioRichiestoPayload[];
  };

export type PacchettoAggiornaPayload = Partial<PacchettoCreaPayload>;

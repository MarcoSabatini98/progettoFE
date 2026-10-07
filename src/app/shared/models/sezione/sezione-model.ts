import { MediaInterface } from '../media/media-model';

/**
 * Sezione immagine-testo di una pagina del sito: sul sito le immagini si alternano a destra e a sinistra.
 * titolo e testo arrivano già tradotti nella lingua richiesta.
 */
export interface SezioneInterface {
  id: number;
  pagina_id: number;
  titolo: string;
  testo: string;
  ordine: number;
  pubblicata: boolean;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  /** La prima è l'immagine della sezione. */
  media?: MediaInterface[];
}

export type SezioneCreaPayload = Pick<SezioneInterface, 'pagina_id' | 'titolo' | 'testo'> &
  Partial<Pick<SezioneInterface, 'ordine' | 'pubblicata'>>;

export type SezioneAggiornaPayload = Partial<Omit<SezioneCreaPayload, 'pagina_id'>>;

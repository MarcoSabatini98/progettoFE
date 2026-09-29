import { CameraInterface } from '../camera/camera-model';
import { MediaInterface } from '../media/media-model';
import { ServizioInterface } from '../servizio/servizio-model';

/** Tipo di camera venduto sul sito (es. Doppia vista mare). Il cliente prenota una tipologia. */
export interface TipologiaCameraInterface {
  id: number;
  nome: string;
  slug: string;
  descrizione: string | null;
  prezzo_base: number;
  ospiti_max: number;
  superficie_mq: number | null;
  letti: string | null;
  ordine: number;
  attiva: boolean;
  creato_il: string;
  aggiornato_il: string;
  eliminato_il: string | null;

  // ─── Associazioni ───
  servizi?: ServizioInterface[];
  media?: MediaInterface[];
  camere?: CameraInterface[];
}

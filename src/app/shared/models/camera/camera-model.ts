import type {
  STATI_CAMERA,
  STATI_PULIZIA_CAMERA,
} from '../../../core/services/camere/camere-costanti';
import { DataBloccataInterface } from '../data-bloccata/data-bloccata-model';
import { MediaInterface } from '../media/media-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { ServizioInterface } from '../servizio/servizio-model';
import { SituazioneCameraInterface } from '../situazione-camera/situazione-camera-model';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

export type StatoCamera = (typeof STATI_CAMERA)[number];
export type StatoPuliziaCamera = (typeof STATI_PULIZIA_CAMERA)[number];

/** Camera fisica. stato_pulizia lo aggiornano partenze e attività di pulizia. */
export interface CameraInterface {
  id: number;
  numero: string;
  nome: string | null;
  tipologia_id: number;
  piano: number;
  /** null = quello della tipologia. */
  ospiti_max: number | null;
  stato: StatoCamera;
  stato_pulizia: StatoPuliziaCamera;
  /** Token del feed iCal da dare alle OTA. */
  token_ical: string | null;
  note: string | null;
  creato_il: string;
  aggiornato_il: string;
  eliminato_il: string | null;

  // ─── Associazioni ───
  tipologia?: TipologiaCameraInterface;
  servizi?: ServizioInterface[];
  media?: MediaInterface[];
  situazione?: SituazioneCameraInterface | null;
  /** Nel planning: soggiorni e chiusure del periodo. */
  prenotazioni?: PrenotazioneInterface[];
  date_bloccate?: DataBloccataInterface[];
}

export type CameraCreaPayload = Pick<CameraInterface, 'numero' | 'tipologia_id'> &
  Partial<Pick<CameraInterface, 'nome' | 'piano' | 'ospiti_max' | 'stato' | 'note'>> & {
    /** Dotazioni: sostituiscono quelle attuali. */
    servizi?: number[];
  };

export type CameraAggiornaPayload = Partial<CameraCreaPayload>;

export interface FiltriCamere {
  tipologia_id?: number;
  stato?: StatoCamera;
  stato_pulizia?: StatoPuliziaCamera;
  piano?: number;
}

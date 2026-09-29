import { StatoCamera, StatoPuliziaCamera } from '../camera/camera-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

/** Situazione di oggi di una camera (vista v_stato_camere): chi c'è, chi arriva, chi parte. */
export interface SituazioneCameraInterface {
  camera_id: number;
  numero: string | null;
  nome: string | null;
  tipologia_id: number | null;
  stato: StatoCamera | null;
  stato_pulizia: StatoPuliziaCamera | null;
  prenotazione_in_corso_id: number | null;
  arrivo_oggi: boolean | null;
  partenza_oggi: boolean | null;

  // ─── Associazioni ───
  prenotazione_in_corso?: PrenotazioneInterface | null;
}

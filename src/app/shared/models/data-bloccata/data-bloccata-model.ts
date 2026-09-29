import type { ORIGINI_BLOCCO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CalendarioEsternoInterface } from '../calendario-esterno/calendario-esterno-model';
import { CameraInterface } from '../camera/camera-model';

export type OrigineBlocco = (typeof ORIGINI_BLOCCO)[number];

/** Periodo non prenotabile (chiusura, manutenzione, prenotazione da iCal). camera_id null = struttura chiusa. */
export interface DataBloccataInterface {
  id: number;
  camera_id: number | null;
  /** 'YYYY-MM-DD' */
  data_inizio: string;
  /** 'YYYY-MM-DD' */
  data_fine: string;
  motivo: string | null;
  origine: OrigineBlocco;
  calendario_id: number | null;
  uid_esterno: string | null;
  creato_da: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  camera?: CameraInterface | null;
  calendario?: CalendarioEsternoInterface | null;
}

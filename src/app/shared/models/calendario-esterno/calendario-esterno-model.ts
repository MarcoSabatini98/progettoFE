import type { CANALI_OTA } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CameraInterface } from '../camera/camera-model';

export type CanaleOta = (typeof CANALI_OTA)[number];

/** Calendario iCal di un portale (Booking, Airbnb...) collegato a una camera. */
export interface CalendarioEsternoInterface {
  id: number;
  camera_id: number;
  canale: CanaleOta;
  nome: string | null;
  url: string;
  attivo: boolean;
  ultima_sincronizzazione_il: string | null;
  ultimo_esito: string | null;
  errori_consecutivi: number;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  camera?: CameraInterface;
}

export type CalendarioEsternoCreaPayload = Pick<
  CalendarioEsternoInterface,
  'camera_id' | 'canale' | 'url'
> &
  Partial<Pick<CalendarioEsternoInterface, 'attivo'>> & { nome: string };

export type CalendarioEsternoAggiornaPayload = Partial<
  Omit<CalendarioEsternoCreaPayload, 'camera_id'>
>;

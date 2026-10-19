import { CameraInterface } from '../camera/camera-model';

/** Link iCal di una camera da incollare nelle OTA. */
export interface LinkEsportazioneInterface extends Pick<CameraInterface, 'numero' | 'nome'> {
  camera_id: number;
  /** null = la camera non ha ancora un token iCal. */
  url: string | null;
}

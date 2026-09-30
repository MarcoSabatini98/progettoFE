import { CameraInterface } from '../camera/camera-model';
import { PeriodoInterface } from '../periodo/periodo-model';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

/** Totali di un gruppo di soggiorni; valore in euro. */
interface TotaliRicavo {
  prenotazioni: number;
  notti: number;
  valore: number;
}

/** Ricavi dei soggiorni arrivati nel periodo; gruppi dal valore più alto. */
export interface ReportRicaviInterface extends PeriodoInterface {
  totale: number;
  per_camera: (TotaliRicavo & { camera_id: number } & Pick<CameraInterface, 'numero'>)[];
  per_tipologia: (TotaliRicavo & { tipologia_id: number } & Pick<
      TipologiaCameraInterface,
      'nome'
    >)[];
}

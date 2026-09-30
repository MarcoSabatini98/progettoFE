import { BloccoCameraInterface } from '../blocco-camera/blocco-camera-model';
import { FiltriDisponibilita } from '../disponibilita/disponibilita-model';
import { PreventivoInterface } from '../preventivo/preventivo-model';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

/**
 * Tipologia scelta dai risultati della ricerca, con la camera già bloccata:
 * da qui l'ospite completa la prenotazione.
 */
export interface SceltaSoggiornoInterface {
  tipologia: TipologiaCameraInterface;
  /** Preventivo della ricerca, prima di codice sconto, pacchetto ed extra. */
  preventivo: PreventivoInterface;
  filtri: FiltriDisponibilita;
  blocco: BloccoCameraInterface;
}

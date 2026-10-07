import { PianoTariffarioInterface } from '../piano-tariffario/piano-tariffario-model';
import { TassaSoggiornoInterface } from '../tassa-soggiorno/tassa-soggiorno-model';

/** Per il sito: piani tariffari attivi e tassa di soggiorno in vigore oggi (null = nessuna). */
export interface CondizioniSoggiornoInterface {
  piani: PianoTariffarioInterface[];
  tassa: TassaSoggiornoInterface | null;
}

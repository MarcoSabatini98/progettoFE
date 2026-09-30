import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { SchedinaOspiteInterface } from '../schedina-ospite/schedina-ospite-model';

/** Ospiti di una prenotazione per Alloggiati Web: capofamiglia e capogruppo prima. */
export interface SchedaAlloggiatiInterface {
  prenotazione: Pick<PrenotazioneInterface, 'id' | 'codice' | 'stato' | 'data_arrivo'>;
  /** true = tutti gli ospiti hanno la schedina pronta. */
  completa: boolean;
  ospiti: SchedinaOspiteInterface[];
}

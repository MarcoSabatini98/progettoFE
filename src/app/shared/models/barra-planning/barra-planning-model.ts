import { CameraInterface } from '../camera/camera-model';
import { DataBloccataInterface } from '../data-bloccata/data-bloccata-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

/**
 * Soggiorno o chiusura su una riga del planning. da e a sono le colonne dei giorni
 * (1 = primo giorno mostrato, a esclusa), già tagliate sul periodo.
 */
export interface BarraPlanningInterface {
  da: number;
  a: number;
  /** Comincia prima del periodo mostrato. */
  prima: boolean;
  /** Finisce dopo il periodo mostrato. */
  dopo: boolean;
  prenotazione?: PrenotazioneInterface;
  chiusura?: DataBloccataInterface;
}

/** Una camera con le sue barre. */
export interface RigaPlanningInterface {
  camera: CameraInterface;
  barre: BarraPlanningInterface[];
}

/** Prenotazione trascinata su un'altra camera o altri giorni: si sposta dopo la conferma. */
export interface SpostamentoPlanningInterface {
  prenotazione: PrenotazioneInterface;
  camera: CameraInterface;
  /** 'YYYY-MM-DD' */
  data_arrivo: string;
  /** 'YYYY-MM-DD' */
  data_partenza: string;
}

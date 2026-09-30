import { Canale } from '../prenotazione/prenotazione-model';

/** Prenotazioni create nel periodo da un canale. valore in euro, senza cancellate e no-show. */
export interface StatisticaCanaleInterface {
  canale: Canale;
  prenotazioni: number;
  cancellate: number;
  no_show: number;
  notti: number;
  valore: number;
  /** Notti per prenotazione. */
  durata_media: number;
  /** Giorni tra la prenotazione e l'arrivo. */
  anticipo_medio_giorni: number;
}

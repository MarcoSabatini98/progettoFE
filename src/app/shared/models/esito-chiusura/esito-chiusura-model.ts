import { DataBloccataInterface } from '../data-bloccata/data-bloccata-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

/**
 * Chiusura appena creata. Le prenotazioni già presenti nel periodo restano:
 * tornano qui perché lo staff decida cosa farne.
 */
export interface EsitoChiusuraInterface {
  chiusura: DataBloccataInterface;
  prenotazioni_in_conflitto: Pick<
    PrenotazioneInterface,
    'id' | 'codice' | 'camera_id' | 'data_arrivo' | 'data_partenza'
  >[];
}

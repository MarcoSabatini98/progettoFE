import { OspiteCreaPayload } from '../ospite/ospite-model';
import {
  OspiteSoggiornoInterface,
  RigaOspitePayload,
} from '../prenotazione-ospite/prenotazione-ospite-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

/** Di chi è già registrato il link mostra solo il nome e cosa manca: i dati restano privati. */
export type OspiteCheckinInterface = Pick<
  OspiteSoggiornoInterface,
  'nome' | 'cognome' | 'tipo_alloggiato' | 'campi_mancanti'
>;

/** Riepilogo per la pagina di check-in online, aperta dal link con token. */
export type CheckinOnlineInterface = Pick<
  PrenotazioneInterface,
  'codice' | 'data_arrivo' | 'data_partenza' | 'adulti' | 'bambini' | 'checkin_online_il'
> & {
  ospiti: OspiteCheckinInterface[];
};

/**
 * L'ospite inserisce i dati a mano, niente anagrafiche esistenti per id.
 * Le righe seguono l'ordine degli ospiti già registrati: i campi assenti restano com'erano.
 */
export interface CheckinOnlinePayload {
  ospiti: RigaOspitePayload<OspiteCreaPayload>[];
}

import { OspiteCreaPayload } from '../ospite/ospite-model';
import {
  OspiteSoggiornoInterface,
  RigaOspitePayload,
} from '../prenotazione-ospite/prenotazione-ospite-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

/** Riepilogo per la pagina di check-in online, aperta dal link con token. */
export type CheckinOnlineInterface = Pick<
  PrenotazioneInterface,
  'codice' | 'data_arrivo' | 'data_partenza' | 'adulti' | 'bambini' | 'checkin_online_il'
> & {
  ospiti: OspiteSoggiornoInterface[];
};

/** L'ospite inserisce da sé tutti gli alloggiati: niente anagrafiche esistenti per id. */
export interface CheckinOnlinePayload {
  ospiti: RigaOspitePayload<OspiteCreaPayload>[];
}

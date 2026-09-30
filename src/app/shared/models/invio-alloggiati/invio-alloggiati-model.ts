import type { ESITI_ALLOGGIATI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { UtenteInterface } from '../utente/utente-model';

export type EsitoAlloggiati = (typeof ESITI_ALLOGGIATI)[number];

/** Schedina di un ospite inviata ad Alloggiati Web, con l'esito del portale. */
export interface InvioAlloggiatiInterface {
  id: number;
  prenotazione_id: number;
  ospite_id: number;
  /** Riga a larghezza fissa del tracciato ufficiale. */
  schedina: string;
  esito: EsitoAlloggiati;
  messaggio: string | null;
  inviato_da: number | null;
  inviato_il: string;

  // ─── Associazioni ───
  mittente?: UtenteInterface | null;
}

/** Esito restituito dal portale per tutte le schedine della prenotazione. */
export type RegistraInvioPayload = Pick<InvioAlloggiatiInterface, 'esito'> &
  Partial<Pick<InvioAlloggiatiInterface, 'messaggio'>>;

/** Soggiorno degli ultimi giorni senza invio registrato. */
export type SoggiornoDaInviareInterface = Pick<
  PrenotazioneInterface,
  'id' | 'codice' | 'data_arrivo' | 'camera_id'
>;

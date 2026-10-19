import { ConversazioneInterface, StatoPresenza } from '../conversazione/conversazione-model';
import { MessaggioInterface } from '../messaggio/messaggio-model';

/** Ogni evento della chat porta l'uuid della conversazione. */
interface EventoConversazioneBase {
  conversazione: string;
}

/** MESSAGGIO: con la conversazione aggiornata, per l'elenco. */
export interface EventoMessaggioInterface extends EventoConversazioneBase {
  messaggio: MessaggioInterface;
  dettaglio: ConversazioneInterface;
}

export interface EventoMessaggioModificatoInterface extends EventoConversazioneBase {
  messaggio: MessaggioInterface;
}

export interface EventoMessaggioEliminatoInterface extends EventoConversazioneBase {
  messaggio_id: number;
}

/** CONVERSAZIONE: assegnata, chiusa, rinominata o con membri cambiati. */
export interface EventoConversazioneInterface extends EventoConversazioneBase {
  dettaglio: ConversazioneInterface;
}

/** SCRIVE: arriva anche dalle altre schede dello stesso utente. */
export interface EventoScriveInterface extends EventoConversazioneBase {
  utente_id: number | null;
  visitatore_id: number | null;
  attivo: boolean;
}

/** PRESENZA (uno) e PRESENZE (tutto lo staff non offline, al collegamento). */
export interface PresenzaInterface {
  utente_id: number;
  stato: StatoPresenza;
}

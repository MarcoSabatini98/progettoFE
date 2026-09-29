import type {
  STATI_CONVERSAZIONE,
  TIPI_CONVERSAZIONE,
} from '../../../core/services/chat/chat-costanti';
import { ConversazionePartecipanteInterface } from '../conversazione-partecipante/conversazione-partecipante-model';
import { UtenteInterface } from '../utente/utente-model';
import { VisitatoreInterface } from '../visitatore/visitatore-model';

export type TipoConversazione = (typeof TIPI_CONVERSAZIONE)[number];
export type StatoConversazione = (typeof STATI_CONVERSAZIONE)[number];

/** Utente presente nella conversazione, con i dati della sua presenza. */
export interface PartecipanteInterface extends UtenteInterface {
  ConversazionePartecipante: Pick<
    ConversazionePartecipanteInterface,
    'entrato_il' | 'letto_fino_al'
  >;
}

/**
 * Chat di assistenza (cliente o visitatore con lo staff) o chat interna dello staff.
 * titolo valorizzato = gruppo, null = chat diretta.
 */
export interface ConversazioneInterface {
  id: number;
  uuid: string;
  tipo: TipoConversazione;
  titolo: string | null;
  cliente_id: number | null;
  visitatore_id: number | null;
  prenotazione_id: number | null;
  assegnata_a: number | null;
  stato: StatoConversazione;
  letto_cliente_il: string | null;
  ultimo_messaggio_il: string | null;
  creata_da: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  operatore?: UtenteInterface | null;
  cliente?: UtenteInterface | null;
  visitatore?: VisitatoreInterface | null;
  partecipanti?: PartecipanteInterface[];
  /** Riga del partecipante corrente, per contare i non letti. */
  membri?: ConversazionePartecipanteInterface[];
}

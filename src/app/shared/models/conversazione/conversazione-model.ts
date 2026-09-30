import type {
  STATI_CONVERSAZIONE,
  STATI_PRESENZA,
  TIPI_CONVERSAZIONE,
} from '../../../core/services/chat/chat-costanti';
import { ConversazionePartecipanteInterface } from '../conversazione-partecipante/conversazione-partecipante-model';
import { MessaggioInterface } from '../messaggio/messaggio-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
import { UtenteInterface } from '../utente/utente-model';
import { VisitatoreInterface } from '../visitatore/visitatore-model';

export type TipoConversazione = (typeof TIPI_CONVERSAZIONE)[number];
export type StatoConversazione = (typeof STATI_CONVERSAZIONE)[number];
export type StatoPresenza = (typeof STATI_PRESENZA)[number];

/** Utente presente nella conversazione, con i dati della sua presenza. */
export interface PartecipanteInterface extends UtenteInterface {
  ConversazionePartecipante: Pick<
    ConversazionePartecipanteInterface,
    'entrato_il' | 'letto_fino_al'
  >;
  /** Solo nel dettaglio. */
  presenza?: StatoPresenza;
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

  // ─── Riepilogo (elenco e dettaglio) ───
  non_letti?: number;
  /** Inizio dell'ultimo messaggio. */
  anteprima?: string | null;

  // ─── Associazioni ───
  operatore?: UtenteInterface | null;
  cliente?: UtenteInterface | null;
  visitatore?: VisitatoreInterface | null;
  partecipanti?: PartecipanteInterface[];
  /** Riga del partecipante corrente, per contare i non letti. */
  membri?: ConversazionePartecipanteInterface[];
}

/** Staff: tipo 'staff' se assente. Clienti e visitatori vedono solo la propria assistenza. */
export interface FiltriConversazioni extends ParametriPaginaInterface {
  tipo?: TipoConversazione;
  /** Solo assistenza: assegnate a me o ancora da prendere. */
  assegnate?: 'mie' | 'libere';
  stato?: StatoConversazione;
}

/** Si apre sempre con il primo messaggio. */
export type AssistenzaCreaPayload = Pick<MessaggioInterface, 'testo'> &
  Partial<Pick<ConversazioneInterface, 'titolo' | 'prenotazione_id'>>;

/** Con più partecipanti è un gruppo e il titolo diventa obbligatorio. */
export type ChatStaffCreaPayload = Pick<MessaggioInterface, 'testo'> &
  Partial<Pick<ConversazioneInterface, 'titolo'>> & {
    partecipanti: number[];
  };

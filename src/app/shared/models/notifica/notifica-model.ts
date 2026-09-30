import type {
  PRIORITA_NOTIFICA,
  TIPI_NOTIFICA,
} from '../../../core/services/sistema/sistema-costanti';
import { PaginaInterface, ParametriPaginaInterface } from '../pagina/pagina-model';

export type TipoNotifica = (typeof TIPI_NOTIFICA)[number];
export type PrioritaNotifica = (typeof PRIORITA_NOTIFICA)[number];

export interface NotificaInterface {
  id: number;
  utente_id: number;
  tipo: TipoNotifica;
  priorita: PrioritaNotifica;
  titolo: string;
  testo: string | null;
  /** Percorso del sito da aprire al clic (es. '/staff/prenotazioni/12'). */
  link: string | null;
  letta_il: string | null;
  creato_il: string;
}

/** Contatore per il badge della campanella. */
export interface ContatoreNonLetteInterface {
  non_lette: number;
}

/** L'elenco porta con sé il contatore, così il badge resta allineato. */
export type PaginaNotificheInterface = PaginaInterface<NotificaInterface> &
  ContatoreNonLetteInterface;

export interface NotificheAggiornateInterface {
  aggiornate: number;
}

export interface FiltriNotifiche extends ParametriPaginaInterface {
  non_lette?: boolean;
}

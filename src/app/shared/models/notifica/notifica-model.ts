import type {
  PRIORITA_NOTIFICA,
  TIPI_NOTIFICA,
} from '../../../core/services/sistema/sistema-costanti';

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

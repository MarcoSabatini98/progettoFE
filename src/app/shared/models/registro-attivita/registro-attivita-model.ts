import type {
  AZIONI_REGISTRO,
  TABELLE_REGISTRO,
} from '../../../core/services/sistema/sistema-costanti';
import { UtenteInterface } from '../utente/utente-model';

export type AzioneRegistro = (typeof AZIONI_REGISTRO)[number];
export type TabellaRegistro = (typeof TABELLE_REGISTRO)[number];

/** Riga di audit scritta dai trigger su prenotazioni, pagamenti e fatture. */
export interface RegistroAttivitaInterface {
  id: number;
  tabella: TabellaRegistro;
  record_id: number;
  azione: AzioneRegistro;
  dati_prima: Record<string, unknown> | null;
  dati_dopo: Record<string, unknown> | null;
  utente_id: number | null;
  ip: string | null;
  creato_il: string;

  // ─── Associazioni ───
  utente?: UtenteInterface | null;
}

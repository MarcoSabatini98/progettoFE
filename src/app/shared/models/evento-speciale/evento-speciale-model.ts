import type { TIPI_EVENTO_SPECIALE } from '../../../core/services/sistema/sistema-costanti';

export type TipoEventoSpeciale = (typeof TIPI_EVENTO_SPECIALE)[number];

/** Evento che alza la domanda (fiera, festa): pesa sul prezzo suggerito. */
export interface EventoSpecialeInterface {
  id: number;
  titolo: string;
  tipo: TipoEventoSpeciale;
  /** 'YYYY-MM-DD' */
  data_inizio: string;
  /** 'YYYY-MM-DD' */
  data_fine: string;
  /** Da 1 a 10. */
  impatto: number;
  note: string | null;
  creato_il: string;
  aggiornato_il: string;
}

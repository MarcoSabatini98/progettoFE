import { FiltriPeriodo } from '../periodo/periodo-model';

/**
 * Suggerimento per un giorno futuro: l'admin vede percentuale e motivi e decide.
 * percentuale tra -30 e +30.
 */
export interface SuggerimentoPrezzoInterface {
  /** 'YYYY-MM-DD' */
  giorno: string;
  occupazione_percentuale: number;
  percentuale: number;
  motivi: { percentuale: number; motivo: string }[];
  /** Euro; solo filtrando per tipologia, altrimenti null. */
  prezzo_suggerito: number | null;
}

/** Senza periodo: i prossimi 30 giorni. */
export type FiltriSuggerimenti = FiltriPeriodo & { tipologia_id?: number };

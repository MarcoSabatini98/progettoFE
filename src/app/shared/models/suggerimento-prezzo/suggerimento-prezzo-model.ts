import { FiltriPeriodo } from '../periodo/periodo-model';

/** Regola che ha mosso il prezzo; valore è la soglia (percentuale o giorni) o il titolo dell'evento. */
export type CodiceMotivo =
  'occupazione_alta' | 'occupazione_buona' | 'occupazione_bassa' | 'ultimo_minuto' | 'evento';

/**
 * Suggerimento per un giorno futuro: l'admin vede percentuale e motivi e decide.
 * percentuale tra -30 e +30.
 */
export interface SuggerimentoPrezzoInterface {
  /** 'YYYY-MM-DD' */
  giorno: string;
  occupazione_percentuale: number;
  percentuale: number;
  /** motivo è la stessa frase in italiano; nel gestionale si traduce da codice e valore. */
  motivi: { codice: CodiceMotivo; valore: number | string; percentuale: number; motivo: string }[];
  /** Euro; solo filtrando per tipologia, altrimenti null. */
  prezzo_suggerito: number | null;
}

/** Senza periodo: i prossimi 30 giorni. */
export type FiltriSuggerimenti = FiltriPeriodo & { tipologia_id?: number };

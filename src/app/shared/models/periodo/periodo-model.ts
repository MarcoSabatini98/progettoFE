/** Intervallo di date AAAA-MM-GG: dal compreso, al escluso (come le notti di un soggiorno). */
export interface PeriodoInterface {
  dal: string;
  al: string;
}

/** Filtro facoltativo per periodo. */
export type FiltriPeriodo = Partial<PeriodoInterface>;

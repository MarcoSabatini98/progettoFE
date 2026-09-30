/** Quanti clienti ci sono in un livello del programma fedeltà. */
export interface ClientiPerLivelloInterface {
  /** Codice del livello, null = senza livello. */
  livello: string | null;
  count: number;
}

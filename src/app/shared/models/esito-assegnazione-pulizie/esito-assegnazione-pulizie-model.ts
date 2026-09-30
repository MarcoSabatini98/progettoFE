/** Assegnazione automatica delle attività libere agli addetti in servizio. */
export interface EsitoAssegnazionePulizieInterface {
  assegnate: number;
  /** Rimaste libere: nessun addetto disponibile. */
  non_assegnate: number;
}

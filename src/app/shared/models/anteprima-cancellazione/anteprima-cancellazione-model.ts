/** Cosa succede se si cancella adesso: mostrato prima della conferma. */
export interface AnteprimaCancellazioneInterface {
  penale: number;
  /** Fino a quando la cancellazione è gratuita; null se non rimborsabile o già oltre. */
  gratuita_fino_al: string | null;
  /** Già pagato: la differenza con la penale viene rimborsata. */
  incassato: number;
}

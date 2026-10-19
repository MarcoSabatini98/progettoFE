/** Giornata delle pulizie generata: riassetti delle camere occupate e checklist completate. */
export interface EsitoGiornataPulizieInterface {
  riassetti: number;
  /** Attività già presenti a cui mancava la checklist. */
  checklist_aggiunte: number;
}

/** Di chi leggere le notti occupate nel calendario del sito: una camera o una tipologia. */
export interface FiltriOccupazione {
  camera_id?: number;
  tipologia_id?: number;
  /** Il blocco di questa sessione non conta come occupato. */
  sessione?: string;
}

/** Notti occupate 'AAAA-MM-GG' nel periodo chiesto: quella della partenza non lo è. */
export interface OccupazioneCameraInterface {
  occupate: string[];
}

/** Camera tenuta da parte mentre l'ospite completa la prenotazione. */
export interface BloccoCameraInterface {
  /** Uuid del percorso di prenotazione: va riusato per prenotare. */
  sessione: string;
  camera_id: number;
  scade_il: string;
}

/** Serve camera_id oppure tipologia_id (sceglie la prima camera libera). */
export interface BloccaCameraPayload {
  sessione?: string;
  camera_id?: number;
  tipologia_id?: number;
  /** AAAA-MM-GG */
  arrivo: string;
  /** AAAA-MM-GG */
  partenza: string;
  ospiti: number;
}

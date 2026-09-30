/** Riepilogo mensile per la dichiarazione dell'imposta di soggiorno. tassa in euro. */
export interface TassaSoggiornoMensileInterface {
  /** 'YYYY-MM' */
  mese: string;
  prenotazioni: number;
  ospiti: number;
  notti: number;
  tassa: number;
}

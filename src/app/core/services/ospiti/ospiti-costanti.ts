// Anagrafiche degli ospiti: stessi limiti di progettoBE (ospiti.validator.js).

export const LUNGHEZZA_ANAGRAFICA = {
  email: 255,
  tipoDocumento: 5,
  codiceFiscale: 16,
  /** Sigle di provincia e codici ISO dei paesi. */
  sigla: 2,
  indirizzo: 255,
  cap: 10,
  citta: 100,
  note: 5000,
} as const;

/** Motivo dell'esenzione dalla tassa di soggiorno. */
export const LUNGHEZZA_MOTIVO_ESENZIONE = 100;

/** Anagrafiche proposte cercando chi aggiungere a un soggiorno. */
export const OSPITI_SUGGERITI = 5;

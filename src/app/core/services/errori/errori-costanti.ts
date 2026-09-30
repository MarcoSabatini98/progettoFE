/** Sezione dei file di traduzione con i testi degli errori: una chiave per codice del backend. */
export const PREFISSO_ERRORI = 'errori';

/** Sezione con i testi degli errori dei campi: una chiave per errore dei validatori (required, email, ...). */
export const PREFISSO_MODULI = 'moduli';

/** Testi di ripiego quando il backend non manda un codice. */
export const ERRORI_LOCALI = {
  generico: 'generico',
  rete: 'rete',
} as const;

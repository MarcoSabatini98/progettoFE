/** Parametro con la pagina da riaprire dopo l'accesso. */
export const PARAMETRO_RITORNO = 'ritorno';

/** Limiti della password (stessi del validatore di progettoBE: bcrypt legge al massimo 72 byte). */
export const LUNGHEZZA_PASSWORD = {
  minima: 8,
  massima: 72,
} as const;

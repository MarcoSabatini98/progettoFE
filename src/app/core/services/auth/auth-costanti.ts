/** Parametro con la pagina da riaprire dopo l'accesso. */
export const PARAMETRO_RITORNO = 'ritorno';

/** Limiti della password (stessi del validatore di progettoBE: bcrypt legge al massimo 72 byte). */
export const LUNGHEZZA_PASSWORD = {
  minima: 8,
  massima: 72,
} as const;

/** Codici dei 401 per token di accesso scaduto o non valido: solo questi si risolvono con un rinnovo. */
export const CODICI_DA_RINNOVARE: readonly string[] = ['TOKEN_SCADUTO', 'TOKEN_NON_VALIDO'];

/** 401 per token del visitatore scaduto o sconosciuto (es. database ripristinato): si butta e se ne chiede uno nuovo. */
export const TOKEN_CHAT_NON_VALIDO = 'TOKEN_CHAT_NON_VALIDO';

/** Cifre del codice di verifica email inviato dal backend. */
export const CIFRE_CODICE_VERIFICA = 6;

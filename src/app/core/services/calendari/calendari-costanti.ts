/** Lunghezze massime dei campi dei calendari esterni (come il backend). */
export const LIMITI_CALENDARI = {
  nome: 100,
  url: 1000,
} as const;

/** Il feed di un portale: solo indirizzi web. */
export const URL_CALENDARIO = /^https?:\/\/\S+$/i;

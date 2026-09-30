/** Pagine usate dalle guardie: accesso e ripiego quando il ruolo non basta. */
export const PERCORSI_AUTH = {
  accesso: '/accesso',
  home: '/',
} as const;

/** Parametro con la pagina da riaprire dopo l'accesso. */
export const PARAMETRO_RITORNO = 'ritorno';

/** Chiavi di route.data lette da ruoloGuard. */
export const DATI_ROTTA = {
  ruoli: 'ruoli',
  permessi: 'permessi',
} as const;

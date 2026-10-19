/** Chiavi di localStorage: preferenze del singolo dispositivo. */
export const CHIAVI_ARCHIVIO = {
  lingua: 'bb.lingua',
  tema: 'bb.tema',
  /** Presente = c'è un refresh token nel cookie: al riavvio si prova a ripristinare la sessione. */
  sessione: 'bb.sessione',
  /** Token della chat di assistenza di chi non ha un account (dura 30 giorni). */
  tokenChat: 'bb.chat',
} as const;

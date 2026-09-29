// Ruoli e permessi: stessi codici di progettoBE (ruoli.constants.js).

export const RUOLI = {
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
  HOUSEKEEPER_SENIOR: 'housekeeper_senior',
  HOUSEKEEPER: 'housekeeper',
  CLIENTE: 'cliente',
} as const;

/** Ruoli che l'admin può assegnare a un account staff (l'admin nasce solo dal seed). */
export const RUOLI_ASSEGNABILI = [
  RUOLI.RECEPTIONIST,
  RUOLI.HOUSEKEEPER_SENIOR,
  RUOLI.HOUSEKEEPER,
] as const;

/** Squadre della chat interna: ogni membro dello staff entra nel gruppo della sua squadra. */
export const SQUADRE = {
  receptionist: [RUOLI.RECEPTIONIST],
  housekeeping: [RUOLI.HOUSEKEEPER_SENIOR, RUOLI.HOUSEKEEPER],
} as const;

export const PERMESSI = {
  CAMERE_GESTISCI: 'camere.gestisci',
  TARIFFE_GESTISCI: 'tariffe.gestisci',
  CALENDARI_GESTISCI: 'calendari.gestisci',
  PRENOTAZIONI_LEGGI: 'prenotazioni.leggi',
  PRENOTAZIONI_GESTISCI: 'prenotazioni.gestisci',
  CHECKIN_GESTISCI: 'checkin.gestisci',
  OSPITI_GESTISCI: 'ospiti.gestisci',
  ALLOGGIATI_INVIA: 'alloggiati.invia',
  PAGAMENTI_LEGGI: 'pagamenti.leggi',
  PAGAMENTI_REGISTRA: 'pagamenti.registra',
  FATTURE_GESTISCI: 'fatture.gestisci',
  PULIZIE_LEGGI: 'pulizie.leggi',
  PULIZIE_ESEGUI: 'pulizie.esegui',
  PULIZIE_GESTISCI: 'pulizie.gestisci',
  MANUTENZIONE_SEGNALA: 'manutenzione.segnala',
  MANUTENZIONE_GESTISCI: 'manutenzione.gestisci',
  RECENSIONI_MODERA: 'recensioni.modera',
  CHAT_ASSISTENZA: 'chat.assistenza',
  FAQ_GESTISCI: 'faq.gestisci',
  CONTENUTI_GESTISCI: 'contenuti.gestisci',
  UTENTI_GESTISCI: 'utenti.gestisci',
  IMPOSTAZIONI_GESTISCI: 'impostazioni.gestisci',
  ANALYTICS_LEGGI: 'analytics.leggi',
} as const;

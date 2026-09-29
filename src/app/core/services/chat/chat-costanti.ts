// Chat di assistenza e chat interna dello staff: stessi valori di progettoBE (chat.constants.js).

/** assistenza: cliente o visitatore ↔ struttura; staff: chat interna */
export const TIPI_CONVERSAZIONE = ['assistenza', 'staff'] as const;

export const STATI_CONVERSAZIONE = ['aperta', 'chiusa'] as const;

/** Stato di presenza mostrato agli altri membri dello staff. */
export const STATI_PRESENZA = ['online', 'occupato', 'assente', 'offline'] as const;

/** Gruppi di squadra creati in automatico (vedi SQUADRE in ruoli-costanti). */
export const GRUPPI_SQUADRA = {
  receptionist: '#receptionist',
  housekeeping: '#housekeeping',
} as const;

export const TESTO_MAX = 4000;
export const ALLEGATI_MAX = 5;

/**
 * Nomi degli eventi del socket.
 * server → client: MESSAGGIO, MESSAGGIO_MODIFICATO, MESSAGGIO_ELIMINATO,
 *                  LETTO, CONVERSAZIONE, PRESENZA, PRESENZE, NOTIFICA
 * client → server: SCRIVE (e ritorno agli altri), PRESENZA (cambio stato)
 */
export const EVENTI_SOCKET = {
  MESSAGGIO: 'chat:messaggio',
  MESSAGGIO_MODIFICATO: 'chat:messaggio-modificato',
  MESSAGGIO_ELIMINATO: 'chat:messaggio-eliminato',
  LETTO: 'chat:letto',
  CONVERSAZIONE: 'chat:conversazione',
  SCRIVE: 'chat:scrive',
  PRESENZA: 'chat:presenza',
  PRESENZE: 'chat:presenze',
  NOTIFICA: 'notifica',
} as const;

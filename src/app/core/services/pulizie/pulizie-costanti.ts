// Pulizie e manutenzione: stessi valori di progettoBE (pulizie.constants.js).

export const TIPI_PULIZIA = ['partenza', 'riassetto', 'profonda', 'ispezione'] as const;

export const PRIORITA = ['bassa', 'normale', 'alta', 'urgente'] as const;

/** da_fare → in_corso → completata → verificata (dal responsabile) */
export const STATI_ATTIVITA_PULIZIA = ['da_fare', 'in_corso', 'completata', 'verificata'] as const;

/**
 * Passaggi di stato ammessi. true = solo chi gestisce le pulizie
 * (verifica e ispezione respinta), false = anche l'addetto.
 */
export const TRANSIZIONI_PULIZIA = {
  da_fare: { in_corso: false },
  in_corso: { completata: false, da_fare: false },
  completata: { verificata: true, in_corso: true },
  verificata: {},
} as const;

/** Lunghezze massime dei campi di testo, come la validazione del backend. */
export const LUNGHEZZA_PULIZIA = { note: 5000, voce: 150 } as const;

export const STATI_SEGNALAZIONE = ['aperta', 'in_corso', 'risolta', 'annullata'] as const;

export const STATI_SEGNALAZIONE_APERTA = ['aperta', 'in_corso'] as const;

/** Lunghezze massime delle segnalazioni, come la validazione del backend. */
export const LUNGHEZZA_SEGNALAZIONE = { titolo: 150, testo: 10_000 } as const;

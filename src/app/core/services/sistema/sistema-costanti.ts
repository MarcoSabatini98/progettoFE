// Impostazioni, contenuti, notifiche, eventi speciali e registro attività: stessi valori
// di progettoBE (sistema.constants.js).

export const TIPI_IMPOSTAZIONE = ['testo', 'numero', 'booleano', 'json'] as const;

export const TIPI_DOCUMENTO_LEGALE = ['privacy', 'termini', 'cookie'] as const;

export const TIPI_NOTIFICA = [
  'prenotazione',
  'pagamento',
  'pulizia',
  'manutenzione',
  'chat',
  'recensione',
  'sistema',
] as const;

export const PRIORITA_NOTIFICA = ['info', 'successo', 'avviso', 'errore'] as const;

export const TIPI_EVENTO_SPECIALE = ['festivita', 'evento_locale', 'fiera', 'altro'] as const;

export const AZIONI_REGISTRO = ['inserimento', 'modifica', 'eliminazione'] as const;

/** Tabelle scritte dai trigger di audit. */
export const TABELLE_REGISTRO = ['prenotazioni', 'pagamenti', 'fatture'] as const;

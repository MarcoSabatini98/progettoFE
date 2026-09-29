// Prenotazioni, ospiti, calendari esterni e Alloggiati Web: stessi valori di progettoBE
// (prenotazioni.constants.js).

export const STATI_PRENOTAZIONE = [
  'in_attesa',
  'confermata',
  'in_soggiorno',
  'conclusa',
  'cancellata',
  'no_show',
] as const;

/** Stati che occupano la camera. */
export const STATI_ATTIVI = ['in_attesa', 'confermata', 'in_soggiorno'] as const;

/** Stati che contano per ricavi e occupazione. */
export const STATI_FATTURABILI = ['confermata', 'in_soggiorno', 'conclusa'] as const;

export const CANALI = [
  'diretto',
  'telefono',
  'email',
  'walk_in',
  'booking_com',
  'airbnb',
  'expedia',
  'altro',
] as const;

/** Canali OTA: hanno un id_esterno e un calendario iCal. */
export const CANALI_OTA = ['booking_com', 'airbnb', 'expedia', 'altro'] as const;

export const ORIGINI_BLOCCO = ['manuale', 'ical'] as const;

/** Tipo di alloggiato richiesto dal tracciato Alloggiati Web. */
export const TIPI_ALLOGGIATO = [
  'ospite_singolo',
  'capofamiglia',
  'capogruppo',
  'familiare',
  'membro_gruppo',
] as const;

/** Chi ha il documento nella schedina: chi viaggia da solo o guida il gruppo. */
export const TIPI_CON_DOCUMENTO = ['ospite_singolo', 'capofamiglia', 'capogruppo'] as const;

/** Codice Alloggiati Web dell'Italia: per i nati in Italia servono anche comune e provincia. */
export const CODICE_ITALIA = '100000100';

export const ESITI_ALLOGGIATI = ['inviata', 'errore', 'test'] as const;

export const SESSI = ['M', 'F'] as const;

export const TIPI_LUOGO = ['comune', 'stato'] as const;

export const TIPI_CONSENSO = ['privacy', 'termini', 'marketing', 'cookie'] as const;

export const STATI_RECENSIONE = ['in_attesa', 'pubblicata', 'rifiutata'] as const;

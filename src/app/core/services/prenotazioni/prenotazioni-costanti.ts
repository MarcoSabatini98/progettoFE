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

/** Ospiti di una ricerca: stessi limiti di progettoBE (tariffe.validator.js). */
export const LIMITI_OSPITI = { adulti: 50, bambini: 50, etaBambini: 17 } as const;

/** Lunghezza massima delle richieste speciali (prenotazioni.validator.js). */
export const LUNGHEZZA_RICHIESTE = 5000;

/**
 * Formato dei codici sconto (tariffe.validator.js): lettere, cifre, _ e -.
 * Le minuscole vanno bene: il backend porta il codice in maiuscolo.
 */
export const FORMATO_CODICE_SCONTO = /^[A-Z0-9_-]+$/i;

export const LUNGHEZZA_CODICE_SCONTO = 30;

/** Stati in cui il cliente può ancora cancellare o cambiare gli extra (prenotazioni.service.js). */
export const STATI_MODIFICABILI_CLIENTE = ['in_attesa', 'confermata'] as const;

/** Motivo della cancellazione (prenotazioni.validator.js). */
export const LUNGHEZZA_MOTIVO_CANCELLAZIONE = 255;

/** Quantità di un extra (prenotazioni.validator.js). */
export const LIMITI_QUANTITA_EXTRA = { min: 1, max: 255 } as const;

/**
 * Documenti più usati della tabella Alloggiati Web (alloggiati_documenti.csv):
 * bastano per il check-in online, gli altri li inserisce la reception.
 */
export const TIPI_DOCUMENTO_IDENTITA = ['IDENT', 'IDELE', 'PASOR', 'PATEN'] as const;

/** Numero del documento (ospiti.validator.js). */
export const LUNGHEZZA_NUMERO_DOCUMENTO = 30;

/** Voti delle recensioni, da 1 a 5 (recensioni.validator.js). */
export const VOTI_RECENSIONE = [1, 2, 3, 4, 5] as const;

/** Lunghezze massime di titolo e commento (recensioni.validator.js). */
export const LUNGHEZZA_RECENSIONE = { titolo: 150, commento: 5000 } as const;

/** Voti di dettaglio facoltativi di una recensione, nell'ordine del modulo. */
export const CATEGORIE_VOTO = [
  'pulizia',
  'personale',
  'posizione',
  'comfort',
  'qualita_prezzo',
] as const;

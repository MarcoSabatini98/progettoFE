// Tariffe, sconti e programma fedeltà: stessi valori di progettoBE (tariffe.constants.js).

/** Variazione del piano tariffario rispetto al prezzo del giorno. */
export const TIPI_VARIAZIONE_PIANO = ['percentuale', 'importo'] as const;

/** Variazione di un periodo (stagione): prezzo_fisso sostituisce il prezzo base. */
export const TIPI_VARIAZIONE_PERIODO = ['percentuale', 'importo', 'prezzo_fisso'] as const;

export const TIPI_SCONTO = ['percentuale', 'importo'] as const;

export const MOTIVI_PUNTI = ['soggiorno', 'bonus', 'rettifica', 'annullamento'] as const;

/** Limiti dei moduli del listino, come i validatori di progettoBE (tariffe.validator.js). */
export const LIMITI_TARIFFE = {
  nome: 100,
  descrizione: 10_000,
  descrizioneCodice: 255,
  codice: 30,
  /** Notti, ospiti e quantità. */
  piccolo: 255,
  ordine: 65_535,
  ore: 65_535,
  importo: 99_999_999.99,
  importoTassa: 9999.99,
  eta: 120,
  priorita: 255,
  utilizziPerUtente: 65_535,
} as const;

/** Sul sito un'offerta mostra 'Ultimi N giorni' da quando ne mancano tanti alla fine. */
export const GIORNI_SCADENZA_VICINA = 7;

export const FORMATO_CODICE_SCONTO = /^[A-Z0-9_-]+$/;

/** Giorni di una stagione come bit: lun=1, mar=2 ... dom=64 (127 = tutti). */
export const GIORNI_SETTIMANA = [1, 2, 4, 8, 16, 32, 64] as const;
export const TUTTI_I_GIORNI = 127;

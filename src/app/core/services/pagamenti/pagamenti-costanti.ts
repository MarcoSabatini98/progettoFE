// Pagamenti e fatture elettroniche: stessi valori di progettoBE (pagamenti.constants.js).

export const TIPI_PAGAMENTO = ['acconto', 'saldo', 'extra', 'penale', 'rimborso'] as const;

export const METODI_PAGAMENTO = ['stripe', 'paypal', 'bonifico', 'contanti', 'pos', 'ota'] as const;

/** Metodi online: il pagamento parte in_attesa e lo completa il webhook. */
export const METODI_ONLINE = ['stripe', 'paypal'] as const;

/** Metodi registrati a mano dallo staff (incasso in struttura o bonifico ricevuto). */
export const METODI_STRUTTURA = ['bonifico', 'contanti', 'pos', 'ota'] as const;

/** Tipi che lo staff registra a mano: i rimborsi hanno la loro funzione (pagamenti.service.js). */
export const TIPI_INCASSO = ['acconto', 'saldo', 'extra', 'penale'] as const;

/** Importo minimo di un pagamento: i validator vogliono un numero maggiore di zero. */
export const IMPORTO_MINIMO = 0.01;

/** Riferimento, ricevuta e note di un incasso (pagamenti.validator.js). */
export const LUNGHEZZE_INCASSO = { riferimento: 100, documentoFiscale: 50, note: 5000 } as const;

/** Motivo di un annullamento o di un rimborso (pagamenti.validator.js). */
export const LUNGHEZZA_MOTIVO = 255;

export const STATI_PAGAMENTO = ['in_attesa', 'completato', 'fallito', 'annullato'] as const;

/** File scaricabili di una fattura: PDF di cortesia o XML FatturaPA. */
export const TIPI_FILE_FATTURA = ['pdf', 'xml'] as const;

/** TD01 fattura, TD04 nota di credito */
export const TIPI_DOCUMENTO_FATTURA = ['TD01', 'TD04'] as const;

export const STATI_SDI = [
  'bozza',
  'da_inviare',
  'inviata',
  'consegnata',
  'mancata_consegna',
  'scartata',
  'accettata',
  'rifiutata',
] as const;

/** Intestatario, note, righe ed esito SDI di una fattura (fatture.validator.js). */
export const LUNGHEZZE_FATTURA = {
  denominazione: 255,
  nome: 100,
  codiceFiscale: 16,
  partitaIva: 20,
  indirizzo: 255,
  cap: 10,
  comune: 100,
  pec: 255,
  note: 5000,
  descrizione: 255,
  natura: 5,
  idSdi: 50,
  esitoSdi: 10_000,
} as const;

/** Importo massimo di una riga (DECIMAL 10,2), anche in negativo per gli sconti. */
export const IMPORTO_MASSIMO_RIGA = 99_999_999.99;

/** Aliquota IVA in percentuale. */
export const ALIQUOTA_MASSIMA = 100;

/** Provincia e nazione (ISO 3166-1 alpha-2): due lettere. */
export const FORMATO_SIGLA = /^[A-Za-z]{2}$/;

/** Codice destinatario SDI: sette caratteri. */
export const FORMATO_CODICE_DESTINATARIO = /^[A-Za-z0-9]{7}$/;

// ─── Solo frontend ───

/** Nuovo intestatario: in Italia, fattura nel cassetto fiscale o alla PEC. */
export const INTESTATARIO_PREDEFINITO = { nazione: 'IT', codice_destinatario: '0000000' } as const;

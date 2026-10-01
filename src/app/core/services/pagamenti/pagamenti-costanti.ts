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

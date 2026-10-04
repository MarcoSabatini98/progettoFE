import { EntitaMedia } from '../../../shared/models/media/media-model';

/** Lunghezze e valori ammessi dei contenuti (come il backend). */
export const LIMITI_CONTENUTI = {
  versione: 20,
  contenuto: 1_000_000,
  titolo: 150,
  note: 5000,
  impatto: 10,
  traduzione: 100_000,
  domanda: 255,
  risposta: 10_000,
  categoria: 50,
  ordine: 32_767,
} as const;

/** Impatto di un evento nuovo: a metà scala. */
export const IMPATTO_PREDEFINITO = 5;

/** Foto del sito, non legate a un record: copertina della home e galleria della struttura. */
export const FOTO_SITO = ['home', 'struttura'] as const satisfies readonly EntitaMedia[];

/** Campi tradotti in un'area di testo: gli altri stanno su una riga. */
export const CAMPI_LUNGHI: readonly string[] = ['descrizione', 'risposta'];

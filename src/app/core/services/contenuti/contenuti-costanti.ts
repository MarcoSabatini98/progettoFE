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

/**
 * Foto del sito, non legate a un record: la galleria della struttura.
 * Lo sfondo della home sta nelle impostazioni, accanto al logo.
 */
export const FOTO_SITO = ['struttura'] as const satisfies readonly EntitaMedia[];

/** Sfondo della home per tema: se manca quello del tema in uso si mostra l'altro. */
export const SFONDI_HOME = { chiaro: 'home', scuro: 'home_scuro' } as const satisfies Record<
  string,
  EntitaMedia
>;

/** Campi tradotti in un'area di testo: gli altri stanno su una riga. */
export const CAMPI_LUNGHI: readonly string[] = ['descrizione', 'risposta'];

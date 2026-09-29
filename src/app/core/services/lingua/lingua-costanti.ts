import type { Lingua } from '../../../shared/models/lingua/lingua-model';

/** Lingue del sito, nell'ordine in cui compaiono nel selettore. */
export const LINGUE = ['it', 'en', 'fr', 'de', 'es'] as const;

export const LINGUA_PREDEFINITA: Lingua = 'it';

/** Cartella di public/ con un file JSON di traduzioni per lingua. */
export const PERCORSO_TRADUZIONI = 'i18n';

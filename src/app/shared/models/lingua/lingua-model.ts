import type { LINGUE } from '../../../core/services/lingua/lingua-costanti';

/** Codice ISO di una lingua del sito (it, en, fr, de, es). */
export type Lingua = (typeof LINGUE)[number];

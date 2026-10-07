import type { PAGINE_SITO } from '../../../core/services/sistema/sistema-costanti';
import { MediaInterface } from '../media/media-model';
import { SezioneInterface } from '../sezione/sezione-model';

export type ChiavePagina = (typeof PAGINE_SITO)[number];

/**
 * Pagina del sito (home, struttura, attività): descrizione sotto il titolo, copertina e sezioni.
 * Sul sito arrivano solo le sezioni pubblicate, già tradotte.
 */
export interface PaginaSitoInterface {
  id: number;
  chiave: ChiavePagina;
  descrizione: string | null;
  aggiornato_il: string;

  // ─── Associazioni ───
  /** La prima è la copertina. */
  media?: MediaInterface[];
  sezioni?: SezioneInterface[];
}

/** Vuota = sotto il titolo resta l'introduzione predefinita. */
export interface PaginaSitoAggiornaPayload {
  descrizione: string | null;
}

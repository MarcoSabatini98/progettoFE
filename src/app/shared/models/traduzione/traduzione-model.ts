import type { CAMPI_TRADUCIBILI } from '../../../core/services/sistema/sistema-costanti';
import { Lingua } from '../lingua/lingua-model';

export type EntitaTraducibile = keyof typeof CAMPI_TRADUCIBILI;

/** Un campo tradotto di un record. L'italiano resta nella tabella originale. */
export interface TraduzioneInterface {
  id: number;
  entita: EntitaTraducibile;
  entita_id: number;
  campo: string;
  lingua: Lingua;
  testo: string;
}

/** Traduzioni di un record raggruppate: { en: { nome: '...', descrizione: '...' } }. */
export type TraduzioniPerLinguaInterface = Partial<Record<Lingua, Record<string, string>>>;

/** Testo vuoto o null = elimina la traduzione di quel campo. */
export type TraduzioniPayload = Partial<Record<Lingua, Record<string, string | null>>>;

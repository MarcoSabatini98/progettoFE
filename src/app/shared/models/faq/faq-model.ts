import { TraduzioneInterface } from '../traduzione/traduzione-model';
import { UtenteInterface } from '../utente/utente-model';

/** Domanda frequente. domanda e risposta arrivano già tradotte nella lingua richiesta. */
export interface FaqInterface {
  id: number;
  domanda: string;
  risposta: string;
  categoria: string | null;
  ordine: number;
  pubblicata: boolean;
  creato_da: number | null;
  aggiornato_da: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  autore?: UtenteInterface | null;
  /** Solo nel dettaglio. */
  traduzioni?: TraduzioneInterface[];
}

export interface FiltriFaq {
  categoria?: string;
  pubblicata?: boolean;
}

export type FaqCreaPayload = Pick<FaqInterface, 'domanda' | 'risposta'> &
  Partial<Pick<FaqInterface, 'categoria' | 'ordine' | 'pubblicata'>>;

export type FaqAggiornaPayload = Partial<FaqCreaPayload>;

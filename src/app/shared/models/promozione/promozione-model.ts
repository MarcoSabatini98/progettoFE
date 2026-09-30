import type { TIPI_SCONTO } from '../../../core/services/tariffe/tariffe-costanti';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

export type TipoSconto = (typeof TIPI_SCONTO)[number];

/** Sconto automatico per soggiorni e date di prenotazione in una finestra. */
export interface PromozioneInterface {
  id: number;
  nome: string;
  descrizione: string | null;
  tipologia_id: number | null;
  /** 'YYYY-MM-DD' */
  soggiorno_dal: string;
  /** 'YYYY-MM-DD' */
  soggiorno_al: string;
  prenotabile_dal: string | null;
  prenotabile_al: string | null;
  tipo_sconto: TipoSconto;
  valore: number;
  ospiti_min: number | null;
  ospiti_max: number | null;
  notti_min: number | null;
  attiva: boolean;
  creato_da: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  tipologia?: TipologiaCameraInterface | null;
}

export type PromozioneCreaPayload = Pick<
  PromozioneInterface,
  'nome' | 'soggiorno_dal' | 'soggiorno_al' | 'tipo_sconto' | 'valore'
> &
  Partial<
    Pick<
      PromozioneInterface,
      | 'descrizione'
      | 'tipologia_id'
      | 'prenotabile_dal'
      | 'prenotabile_al'
      | 'ospiti_min'
      | 'ospiti_max'
      | 'notti_min'
      | 'attiva'
    >
  >;

export type PromozioneAggiornaPayload = Partial<PromozioneCreaPayload>;

export interface FiltriPromozioni {
  attiva?: boolean;
  tipologia_id?: number;
}

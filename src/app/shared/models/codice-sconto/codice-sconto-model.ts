import { TipoSconto } from '../promozione/promozione-model';

/** Codice che il cliente inserisce alla prenotazione (es. ESTATE10). */
export interface CodiceScontoInterface {
  id: number;
  codice: string;
  descrizione: string | null;
  tipo_sconto: TipoSconto;
  valore: number;
  valido_dal: string | null;
  valido_al: string | null;
  importo_minimo: number | null;
  notti_min: number | null;
  utilizzi_max: number | null;
  utilizzi_per_utente: number | null;
  utilizzi: number;
  attivo: boolean;
  creato_da: number | null;
  creato_il: string;
  aggiornato_il: string;
}

/** Cosa vale un codice per il sito: contatori e limiti restano interni. */
export type CodiceScontoVerificatoInterface = Pick<
  CodiceScontoInterface,
  'codice' | 'descrizione' | 'tipo_sconto' | 'valore' | 'importo_minimo' | 'notti_min'
>;

export type CodiceScontoCreaPayload = Pick<
  CodiceScontoInterface,
  'codice' | 'tipo_sconto' | 'valore'
> &
  Partial<
    Pick<
      CodiceScontoInterface,
      | 'descrizione'
      | 'valido_dal'
      | 'valido_al'
      | 'importo_minimo'
      | 'notti_min'
      | 'utilizzi_max'
      | 'utilizzi_per_utente'
      | 'attivo'
    >
  >;

export type CodiceScontoAggiornaPayload = Partial<CodiceScontoCreaPayload>;

export interface FiltriCodiciSconto {
  attivo?: boolean;
  cerca?: string;
}

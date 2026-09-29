/** Imposta di soggiorno comunale valida in un periodo. */
export interface TassaSoggiornoInterface {
  id: number;
  nome: string;
  /** 'YYYY-MM-DD' */
  valida_dal: string;
  /** 'YYYY-MM-DD' */
  valida_al: string;
  /** Euro per ospite per notte. */
  importo_notte: number;
  /** Notti oltre le quali non si paga più. */
  notti_max: number | null;
  /** Sotto questa età l'ospite è esente. */
  eta_esenzione: number | null;
  attiva: boolean;
  creato_il: string;
  aggiornato_il: string;
}

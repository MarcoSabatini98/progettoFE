import type { TIPI_VARIAZIONE_PERIODO } from '../../../core/services/tariffe/tariffe-costanti';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

export type TipoVariazionePeriodo = (typeof TIPI_VARIAZIONE_PERIODO)[number];

/** Stagione o periodo con prezzo diverso. tipologia_id null = vale per tutte le tipologie. */
export interface PeriodoTariffarioInterface {
  id: number;
  nome: string;
  tipologia_id: number | null;
  /** 'YYYY-MM-DD' */
  data_inizio: string;
  /** 'YYYY-MM-DD' */
  data_fine: string;
  /** Giorni in cui vale, come somma di bit: 1=lun 2=mar 4=mer 8=gio 16=ven 32=sab 64=dom. */
  giorni_settimana: number;
  tipo_variazione: TipoVariazionePeriodo;
  valore: number;
  soggiorno_minimo: number | null;
  priorita: number;
  attivo: boolean;
  creato_da: number | null;
  aggiornato_da: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  tipologia?: TipologiaCameraInterface | null;
}

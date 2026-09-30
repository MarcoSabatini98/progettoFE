import { MetodoPagamento } from '../pagamento/pagamento-model';

/** Incasso netto di un mese per metodo (vista v_incassi_mensili). Rimborsi sottratti. */
export interface IncassoMensileInterface {
  /** 'YYYY-MM' */
  mese: string;
  metodo: MetodoPagamento;
  movimenti: number;
  netto: number;
}

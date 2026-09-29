import type {
  METODI_PAGAMENTO,
  STATI_PAGAMENTO,
  TIPI_PAGAMENTO,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { UtenteInterface } from '../utente/utente-model';

export type TipoPagamento = (typeof TIPI_PAGAMENTO)[number];
export type MetodoPagamento = (typeof METODI_PAGAMENTO)[number];
export type StatoPagamento = (typeof STATI_PAGAMENTO)[number];

/** Movimento di denaro su una prenotazione. L'importo è sempre positivo: il tipo dice la direzione. */
export interface PagamentoInterface {
  id: number;
  uuid: string;
  prenotazione_id: number;
  tipo: TipoPagamento;
  metodo: MetodoPagamento;
  stato: StatoPagamento;
  importo: number;
  valuta: string;
  /** Id di Stripe o PayPal. */
  id_transazione: string | null;
  /** Es. CRO del bonifico. */
  riferimento: string | null;
  /** Numero della ricevuta. */
  documento_fiscale: string | null;
  /** Assente nella scheda della prenotazione. */
  link_pagamento?: string | null;
  pagato_il: string | null;
  registrato_da: number | null;
  note: string | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  prenotazione?: PrenotazioneInterface;
  operatore?: UtenteInterface | null;
}

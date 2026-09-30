import type {
  METODI_ONLINE,
  METODI_PAGAMENTO,
  METODI_STRUTTURA,
  STATI_PAGAMENTO,
  TIPI_PAGAMENTO,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
import { FiltriPeriodo } from '../periodo/periodo-model';
import { AccessoPerCodicePayload, PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { UtenteInterface } from '../utente/utente-model';

export type TipoPagamento = (typeof TIPI_PAGAMENTO)[number];
export type MetodoPagamento = (typeof METODI_PAGAMENTO)[number];
export type StatoPagamento = (typeof STATI_PAGAMENTO)[number];
export type MetodoOnline = (typeof METODI_ONLINE)[number];
export type MetodoStruttura = (typeof METODI_STRUTTURA)[number];

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

/** Senza importo si paga quanto dovuto ora (acconto o saldo). */
export interface PagaOnlinePayload {
  metodo: MetodoOnline;
  importo?: number;
}

export type PagaPerCodicePayload = AccessoPerCodicePayload & PagaOnlinePayload;

/** Link di pagamento creato dallo staff. */
export interface AvviaOnlinePayload extends PagaOnlinePayload {
  /** Manda il link all'ospite. */
  invia_email?: boolean;
}

/** Incasso in struttura o bonifico ricevuto. */
export type RegistraPagamentoPayload = Pick<PagamentoInterface, 'tipo' | 'importo'> &
  Partial<Pick<PagamentoInterface, 'riferimento' | 'documento_fiscale' | 'note'>> & {
    metodo: MetodoStruttura;
  };

export interface RimborsoPayload {
  /** Vuoto = rimborso totale. */
  importo?: number;
  motivo: string;
  /** Registra il rimborso anche se il provider non risponde. */
  forza?: boolean;
}

export interface FiltriPagamenti extends ParametriPaginaInterface, FiltriPeriodo {
  stato?: StatoPagamento[];
  metodo?: MetodoPagamento[];
  tipo?: TipoPagamento[];
}

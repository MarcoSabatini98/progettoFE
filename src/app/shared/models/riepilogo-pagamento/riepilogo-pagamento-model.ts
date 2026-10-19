import { MetodoOnline } from '../pagamento/pagamento-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { SaldoPrenotazioneInterface } from '../saldo-prenotazione/saldo-prenotazione-model';

/** Coordinate per il bonifico, se la struttura ha impostato l'IBAN. */
export interface DatiBonificoInterface {
  iban: string;
  intestatario: string | null;
  causale: string;
}

/** Cosa resta da pagare e come: la pagina di pagamento del cliente. */
export type RiepilogoPagamentoInterface = Pick<
  SaldoPrenotazioneInterface,
  'dovuto' | 'incassato' | 'rimborsato' | 'saldo'
> &
  Pick<PrenotazioneInterface, 'acconto_richiesto'> & {
    da_pagare_ora: number;
    /** Solo i metodi attivi sul server. */
    metodi_online: MetodoOnline[];
    bonifico: DatiBonificoInterface | null;
  };

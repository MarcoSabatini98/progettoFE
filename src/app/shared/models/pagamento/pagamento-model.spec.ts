import { describe, expect, it } from 'vitest';

import {
  METODI_STRUTTURA,
  STATI_PAGAMENTO,
  TIPI_INCASSO,
  TIPI_PAGAMENTO,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { PagamentoInterface, RegistraPagamentoPayload } from './pagamento-model';

describe('PagamentoInterface', () => {
  it('accetta un saldo in contanti registrato in struttura', () => {
    const pagamento: PagamentoInterface = {
      id: 1,
      uuid: '6f1c2b1e-0000-4000-8000-000000000021',
      prenotazione_id: 12,
      tipo: 'saldo',
      metodo: 'contanti',
      stato: 'completato',
      importo: 148,
      valuta: 'EUR',
      id_transazione: null,
      riferimento: null,
      documento_fiscale: '0012',
      pagato_il: '2026-10-03T09:00:00.000Z',
      registrato_da: 3,
      note: null,
      creato_il: '2026-10-03T09:00:00.000Z',
      aggiornato_il: '2026-10-03T09:00:00.000Z',
    };

    expect(TIPI_PAGAMENTO).toContain(pagamento.tipo);
    expect(STATI_PAGAMENTO).toContain(pagamento.stato);
    expect(METODI_STRUTTURA).toContain(pagamento.metodo);
  });

  it('accetta un bonifico ricevuto', () => {
    const incasso: RegistraPagamentoPayload = {
      tipo: 'acconto',
      metodo: 'bonifico',
      importo: 60,
      riferimento: 'CRO123',
    };

    expect(METODI_STRUTTURA).toContain(incasso.metodo);
    expect(TIPI_INCASSO).toContain(incasso.tipo);
  });
});

import { describe, expect, it } from 'vitest';

import { METODI_ONLINE } from '../../../core/services/pagamenti/pagamenti-costanti';
import { RiepilogoPagamentoInterface } from './riepilogo-pagamento-model';

describe('RiepilogoPagamentoInterface', () => {
  it("accetta un soggiorno con l'acconto da pagare", () => {
    const riepilogo: RiepilogoPagamentoInterface = {
      dovuto: 208,
      incassato: 0,
      rimborsato: 0,
      saldo: 208,
      acconto_richiesto: 60,
      da_pagare_ora: 60,
      metodi_online: ['stripe'],
      bonifico: null,
    };

    expect(METODI_ONLINE).toContain(riepilogo.metodi_online[0]);
    expect(riepilogo.da_pagare_ora).toBe(riepilogo.acconto_richiesto);
  });
});

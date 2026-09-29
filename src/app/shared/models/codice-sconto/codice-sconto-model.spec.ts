import { describe, expect, it } from 'vitest';

import { CodiceScontoInterface } from './codice-sconto-model';

describe('CodiceScontoInterface', () => {
  it('accetta un codice a importo fisso con limite di utilizzi', () => {
    const codice: CodiceScontoInterface = {
      id: 1,
      codice: 'BENVENUTO20',
      descrizione: null,
      tipo_sconto: 'importo',
      valore: 20,
      valido_dal: null,
      valido_al: '2026-12-31',
      importo_minimo: 150,
      notti_min: null,
      utilizzi_max: 100,
      utilizzi_per_utente: 1,
      utilizzi: 12,
      attivo: true,
      creato_da: null,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(codice.utilizzi).toBeLessThan(codice.utilizzi_max!);
  });
});

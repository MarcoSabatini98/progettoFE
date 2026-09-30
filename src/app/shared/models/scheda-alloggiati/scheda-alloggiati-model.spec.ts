import { describe, expect, it } from 'vitest';

import { SchedaAlloggiatiInterface } from './scheda-alloggiati-model';

describe('SchedaAlloggiatiInterface', () => {
  it('accetta una prenotazione senza ospiti come incompleta', () => {
    const scheda: SchedaAlloggiatiInterface = {
      prenotazione: { id: 8, codice: 'BB-ABC123', stato: 'confermata', data_arrivo: '2026-10-01' },
      completa: false,
      ospiti: [],
    };

    expect(scheda.completa).toBe(false);
  });
});

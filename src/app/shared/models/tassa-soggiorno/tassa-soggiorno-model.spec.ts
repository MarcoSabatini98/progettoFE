import { describe, expect, it } from 'vitest';

import { TassaSoggiornoInterface } from './tassa-soggiorno-model';

describe('TassaSoggiornoInterface', () => {
  it('accetta una tassa con esenzione per i minori di 14 anni', () => {
    const tassa: TassaSoggiornoInterface = {
      id: 1,
      nome: 'Imposta comunale 2026',
      valida_dal: '2026-01-01',
      valida_al: '2026-12-31',
      importo_notte: 2,
      notti_max: 7,
      eta_esenzione: 14,
      attiva: true,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(tassa.importo_notte * tassa.notti_max!).toBe(14);
  });
});

import { describe, expect, it } from 'vitest';

import { TassaSoggiornoMensileInterface } from './tassa-soggiorno-mensile-model';

describe('TassaSoggiornoMensileInterface', () => {
  it('accetta il riepilogo di un mese', () => {
    const valore: TassaSoggiornoMensileInterface = {
      mese: '2026-08',
      prenotazioni: 12,
      ospiti: 30,
      notti: 90,
      tassa: 180,
    };

    expect(valore.mese).toMatch(/^\d{4}-\d{2}$/);
  });
});

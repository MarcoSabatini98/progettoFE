import { describe, expect, it } from 'vitest';

import { GiornataInterface } from './giornata-model';

describe('GiornataInterface', () => {
  it('accetta un giorno senza movimenti', () => {
    const giornata: GiornataInterface = {
      giorno: '2026-10-01',
      arrivi: [],
      partenze: [],
      in_casa: [],
    };

    expect(giornata.arrivi).toHaveLength(0);
  });
});

import { describe, expect, it } from 'vitest';

import { SuggerimentoPrezzoInterface } from './suggerimento-prezzo-model';

describe('SuggerimentoPrezzoInterface', () => {
  it('accetta un rincaro senza prezzo di tipologia', () => {
    const valore: SuggerimentoPrezzoInterface = {
      giorno: '2026-12-31',
      occupazione_percentuale: 90,
      percentuale: 15,
      motivi: [
        {
          codice: 'occupazione_alta',
          valore: 90,
          percentuale: 15,
          motivo: 'Occupazione oltre il 90%: domanda forte',
        },
      ],
      prezzo_suggerito: null,
    };

    expect(valore.motivi[0].percentuale).toBe(valore.percentuale);
  });
});

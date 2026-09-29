import { describe, expect, it } from 'vitest';

import { LivelloFedeltaInterface } from './livello-fedelta-model';

describe('LivelloFedeltaInterface', () => {
  it('accetta un livello con sconto e colore', () => {
    const livello: LivelloFedeltaInterface = {
      id: 1,
      codice: 'bronze',
      nome: 'Bronze',
      punti_minimi: 0,
      sconto_percentuale: 0,
      colore: '#cd7f32',
    };

    expect(livello.punti_minimi).toBe(0);
  });
});

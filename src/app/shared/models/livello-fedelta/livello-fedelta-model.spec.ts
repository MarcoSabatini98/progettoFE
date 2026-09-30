import { describe, expect, it } from 'vitest';

import { LivelloFedeltaCreaPayload, LivelloFedeltaInterface } from './livello-fedelta-model';

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

  it('accetta un nuovo livello senza sconto', () => {
    const livello: LivelloFedeltaCreaPayload = {
      codice: 'platinum',
      nome: 'Platinum',
      punti_minimi: 5000,
    };

    expect(livello.codice).toMatch(/^[a-z0-9_-]+$/);
  });
});

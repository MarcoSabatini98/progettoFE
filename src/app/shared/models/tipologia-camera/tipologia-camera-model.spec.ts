import { describe, expect, it } from 'vitest';

import { TipologiaCameraInterface } from './tipologia-camera-model';

describe('TipologiaCameraInterface', () => {
  it('accetta una tipologia con servizi e immagini', () => {
    const tipologia: TipologiaCameraInterface = {
      id: 2,
      nome: 'Doppia vista mare',
      slug: 'doppia-vista-mare',
      descrizione: null,
      prezzo_base: 110,
      ospiti_max: 2,
      superficie_mq: 22,
      letti: '1 matrimoniale',
      ordine: 1,
      attiva: true,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
      eliminato_il: null,
      servizi: [],
      media: [],
    };

    expect(tipologia.prezzo_base).toBe(110);
    expect(tipologia.camere).toBeUndefined();
  });
});

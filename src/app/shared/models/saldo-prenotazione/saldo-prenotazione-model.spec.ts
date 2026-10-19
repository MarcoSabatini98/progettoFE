import { describe, expect, it } from 'vitest';

import { SaldoPrenotazioneInterface } from './saldo-prenotazione-model';

describe('SaldoPrenotazioneInterface', () => {
  it("accetta un saldo negativo quando c'è da rimborsare", () => {
    const saldo: SaldoPrenotazioneInterface = {
      dovuto: 60,
      incassato: 100,
      rimborsato: 0,
      saldo: -40,
    };

    expect(saldo.saldo).toBeLessThan(0);
  });
});

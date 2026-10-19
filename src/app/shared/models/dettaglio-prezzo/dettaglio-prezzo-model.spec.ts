import { describe, expect, it } from 'vitest';

import { DettaglioPrezzoInterface } from './dettaglio-prezzo-model';

describe('DettaglioPrezzoInterface', () => {
  it('accetta due notti con una promozione e senza codice', () => {
    const dettaglio: DettaglioPrezzoInterface = {
      notti: [
        { data: '2026-10-01', prezzo: 90, periodo: null },
        { data: '2026-10-02', prezzo: 110, periodo: 'Weekend' },
      ],
      promozione: { id: 1, nome: 'Autunno', sconto: 20 },
      codice_sconto: null,
      pacchetto: null,
    };

    const soggiorno = dettaglio.notti.reduce((somma, notte) => somma + notte.prezzo, 0);
    expect(soggiorno).toBe(200);
  });
});

import { describe, expect, it } from 'vitest';

import { EsitoChiusuraInterface } from './esito-chiusura-model';

describe('EsitoChiusuraInterface', () => {
  it('accetta una chiusura con prenotazioni in conflitto', () => {
    const esito: EsitoChiusuraInterface = {
      chiusura: {
        id: 1,
        camera_id: 4,
        data_inizio: '2026-11-10',
        data_fine: '2026-11-12',
        motivo: 'Manutenzione',
        origine: 'manuale',
        calendario_id: null,
        uid_esterno: null,
        creato_da: 1,
        creato_il: '2026-09-01T10:00:00.000Z',
        aggiornato_il: '2026-09-01T10:00:00.000Z',
      },
      prenotazioni_in_conflitto: [
        {
          id: 8,
          codice: 'BB-ABC123',
          camera_id: 4,
          data_arrivo: '2026-11-09',
          data_partenza: '2026-11-11',
        },
      ],
    };

    expect(esito.prenotazioni_in_conflitto).toHaveLength(1);
  });
});

import { describe, expect, it } from 'vitest';

import { CheckinOnlineInterface, CheckinOnlinePayload } from './checkin-online-model';

describe('CheckinOnlineInterface', () => {
  it('accetta un check-in online ancora da fare', () => {
    const riepilogo: CheckinOnlineInterface = {
      codice: 'BB-2026-0012',
      data_arrivo: '2026-10-01',
      data_partenza: '2026-10-03',
      adulti: 2,
      bambini: 0,
      checkin_online_il: null,
      ospiti: [
        {
          nome: 'Anna',
          cognome: 'Rossi',
          tipo_alloggiato: 'capofamiglia',
          campi_mancanti: ['numero_documento'],
        },
      ],
    };
    const invio: CheckinOnlinePayload = {
      ospiti: [{ ospite: { nome: 'Anna', cognome: 'Rossi' }, tipo_alloggiato: 'capofamiglia' }],
    };

    expect(riepilogo.checkin_online_il).toBeNull();
    expect(riepilogo.ospiti[0]).not.toHaveProperty('numero_documento');
    expect(invio.ospiti).toHaveLength(1);
  });
});

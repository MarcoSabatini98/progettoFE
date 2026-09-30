import { describe, expect, it } from 'vitest';

import { MOTIVI_PUNTI } from '../../../core/services/tariffe/tariffe-costanti';
import { MovimentoPuntiInterface, PuntiPayload } from './movimento-punti-model';

describe('MovimentoPuntiInterface', () => {
  it('accetta lo storno dei punti di una prenotazione annullata', () => {
    const movimento: MovimentoPuntiInterface = {
      id: 1,
      utente_id: 1,
      prenotazione_id: 12,
      punti: -80,
      motivo: 'annullamento',
      note: null,
      creato_da: null,
      creato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(MOTIVI_PUNTI).toContain(movimento.motivo);
    expect(movimento.punti).toBeLessThan(0);
  });

  it('accetta una rettifica che toglie punti', () => {
    const rettifica: PuntiPayload = { punti: -50, motivo: 'rettifica', note: 'Doppio accredito' };

    expect(rettifica.punti).toBeLessThan(0);
  });
});

import { describe, expect, it } from 'vitest';

import { TIPI_CONSENSO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { ConsensoInterface } from './consenso-model';

describe('ConsensoInterface', () => {
  it('accetta il rifiuto del marketing', () => {
    const consenso: ConsensoInterface = {
      id: 1,
      utente_id: 1,
      visitatore_id: null,
      ospite_id: null,
      documento_id: null,
      tipo: 'marketing',
      accettato: false,
      creato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_CONSENSO).toContain(consenso.tipo);
    expect(consenso.accettato).toBe(false);
  });
});

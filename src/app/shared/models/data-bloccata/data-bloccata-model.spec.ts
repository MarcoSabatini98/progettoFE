import { describe, expect, it } from 'vitest';

import { ORIGINI_BLOCCO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { DataBloccataInterface } from './data-bloccata-model';

describe('DataBloccataInterface', () => {
  it('accetta una chiusura manuale di tutta la struttura', () => {
    const chiusura: DataBloccataInterface = {
      id: 1,
      camera_id: null,
      data_inizio: '2026-11-10',
      data_fine: '2026-11-30',
      motivo: 'Chiusura stagionale',
      origine: 'manuale',
      calendario_id: null,
      uid_esterno: null,
      creato_da: 1,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(ORIGINI_BLOCCO).toContain(chiusura.origine);
    expect(chiusura.camera_id).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import {
  PRIORITA,
  STATI_ATTIVITA_PULIZIA,
  TIPI_PULIZIA,
} from '../../../core/services/pulizie/pulizie-costanti';
import { AttivitaPuliziaInterface } from './attivita-pulizia-model';

describe('AttivitaPuliziaInterface', () => {
  it('accetta una pulizia di partenza in corso con la checklist a metà', () => {
    const attivita: AttivitaPuliziaInterface = {
      id: 1,
      camera_id: 3,
      prenotazione_id: 12,
      assegnata_a: 5,
      data_prevista: '2026-10-03',
      tipo: 'partenza',
      priorita: 'alta',
      stato: 'in_corso',
      checklist: [
        { voce: 'Cambio lenzuola', fatto: true },
        { voce: 'Bagno', fatto: false },
      ],
      note: null,
      iniziata_il: '2026-10-03T10:30:00.000Z',
      completata_il: null,
      verificata_il: null,
      verificata_da: null,
      creato_da: null,
      creato_il: '2026-10-03T06:00:00.000Z',
      aggiornato_il: '2026-10-03T10:30:00.000Z',
    };

    expect(TIPI_PULIZIA).toContain(attivita.tipo);
    expect(PRIORITA).toContain(attivita.priorita);
    expect(STATI_ATTIVITA_PULIZIA).toContain(attivita.stato);
  });
});

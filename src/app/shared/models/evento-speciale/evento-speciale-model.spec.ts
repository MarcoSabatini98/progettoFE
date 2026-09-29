import { describe, expect, it } from 'vitest';

import { TIPI_EVENTO_SPECIALE } from '../../../core/services/sistema/sistema-costanti';
import { EventoSpecialeInterface } from './evento-speciale-model';

describe('EventoSpecialeInterface', () => {
  it('accetta una fiera di tre giorni', () => {
    const evento: EventoSpecialeInterface = {
      id: 1,
      titolo: 'Fiera del mare',
      tipo: 'fiera',
      data_inizio: '2026-10-10',
      data_fine: '2026-10-12',
      impatto: 7,
      note: null,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_EVENTO_SPECIALE).toContain(evento.tipo);
  });
});

import { describe, expect, it } from 'vitest';

import { TIPI_VARIAZIONE_PERIODO } from '../../../core/services/tariffe/tariffe-costanti';
import { PeriodoTariffarioInterface } from './periodo-tariffario-model';

describe('PeriodoTariffarioInterface', () => {
  it('accetta un periodo valido solo nel fine settimana', () => {
    const periodo: PeriodoTariffarioInterface = {
      id: 1,
      nome: 'Weekend estivi',
      tipologia_id: null,
      data_inizio: '2026-06-01',
      data_fine: '2026-09-15',
      giorni_settimana: 16 + 32, // venerdì e sabato
      tipo_variazione: 'percentuale',
      valore: 20,
      soggiorno_minimo: 2,
      priorita: 10,
      attivo: true,
      creato_da: null,
      aggiornato_da: null,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_VARIAZIONE_PERIODO).toContain(periodo.tipo_variazione);
    // Il sabato (bit 32) è compreso, il lunedì (bit 1) no.
    expect(periodo.giorni_settimana & 32).toBeTruthy();
    expect(periodo.giorni_settimana & 1).toBe(0);
  });
});

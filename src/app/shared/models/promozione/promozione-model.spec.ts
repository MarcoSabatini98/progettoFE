import { describe, expect, it } from 'vitest';

import { TIPI_SCONTO } from '../../../core/services/tariffe/tariffe-costanti';
import { PromozioneInterface } from './promozione-model';

describe('PromozioneInterface', () => {
  it('accetta una promozione a percentuale senza limiti di ospiti', () => {
    const promozione: PromozioneInterface = {
      id: 1,
      nome: 'Early booking',
      descrizione: null,
      tipologia_id: null,
      soggiorno_dal: '2026-07-01',
      soggiorno_al: '2026-08-31',
      prenotabile_dal: null,
      prenotabile_al: '2026-04-30',
      tipo_sconto: 'percentuale',
      valore: 15,
      ospiti_min: null,
      ospiti_max: null,
      notti_min: 3,
      attiva: true,
      creato_da: null,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_SCONTO).toContain(promozione.tipo_sconto);
  });
});

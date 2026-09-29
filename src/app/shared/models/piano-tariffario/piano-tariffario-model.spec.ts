import { describe, expect, it } from 'vitest';

import { TIPI_VARIAZIONE_PIANO } from '../../../core/services/tariffe/tariffe-costanti';
import { PianoTariffarioInterface } from './piano-tariffario-model';

describe('PianoTariffarioInterface', () => {
  it('accetta un piano non rimborsabile con sconto del 10%', () => {
    const piano: PianoTariffarioInterface = {
      id: 2,
      nome: 'Non rimborsabile',
      descrizione: null,
      tipo_variazione: 'percentuale',
      valore_variazione: -10,
      rimborsabile: false,
      ore_cancellazione_gratuita: 0,
      penale_percentuale: 100,
      acconto_percentuale: 100,
      predefinito: false,
      predefinito_unico: null,
      attivo: true,
      ordine: 2,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_VARIAZIONE_PIANO).toContain(piano.tipo_variazione);
    expect(piano.rimborsabile).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { OccupazioneGiornoInterface } from './occupazione-giorno-model';

describe('OccupazioneGiornoInterface', () => {
  it('accetta un giorno senza camere vendute', () => {
    const valore: OccupazioneGiornoInterface = {
      giorno: '2026-10-01',
      camere_disponibili: 8,
      camere_occupate: 0,
      occupazione_percentuale: 0,
      ricavo_camere: 0,
      prezzo_medio: 0,
    };

    expect(valore.ricavo_camere).toBe(0);
  });
});

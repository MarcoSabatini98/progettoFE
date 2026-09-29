import { describe, expect, it } from 'vitest';

import { SituazioneCameraInterface } from './situazione-camera-model';

describe('SituazioneCameraInterface', () => {
  it('accetta una camera con partenza oggi', () => {
    const situazione: SituazioneCameraInterface = {
      camera_id: 1,
      numero: '101',
      nome: null,
      tipologia_id: 2,
      stato: 'attiva',
      stato_pulizia: 'pulita',
      prenotazione_in_corso_id: 12,
      arrivo_oggi: false,
      partenza_oggi: true,
    };

    expect(situazione.partenza_oggi).toBe(true);
  });
});

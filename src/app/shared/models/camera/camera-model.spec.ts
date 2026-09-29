import { describe, expect, it } from 'vitest';

import { STATI_CAMERA, STATI_PULIZIA_CAMERA } from '../../../core/services/camere/camere-costanti';
import { CameraInterface } from './camera-model';

describe('CameraInterface', () => {
  it('accetta una camera attiva da pulire', () => {
    const camera: CameraInterface = {
      id: 1,
      numero: '101',
      nome: null,
      tipologia_id: 2,
      piano: 1,
      ospiti_max: null,
      stato: 'attiva',
      stato_pulizia: 'sporca',
      token_ical: null,
      note: null,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
      eliminato_il: null,
    };

    expect(STATI_CAMERA).toContain(camera.stato);
    expect(STATI_PULIZIA_CAMERA).toContain(camera.stato_pulizia);
  });
});

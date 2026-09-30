import { describe, expect, it } from 'vitest';

import { BloccaCameraPayload, BloccoCameraInterface } from './blocco-camera-model';

describe('BloccoCameraInterface', () => {
  it('accetta il blocco di una tipologia', () => {
    const richiesta: BloccaCameraPayload = {
      tipologia_id: 1,
      arrivo: '2026-10-01',
      partenza: '2026-10-03',
      ospiti: 2,
    };
    const blocco: BloccoCameraInterface = {
      sessione: '3f1c2a4e-9b7d-4c1e-8a2f-5d6e7f809a1b',
      camera_id: 4,
      scade_il: '2026-09-29T10:15:00.000Z',
    };

    expect(richiesta.camera_id).toBeUndefined();
    expect(blocco.camera_id).toBe(4);
  });
});

import { describe, expect, it } from 'vitest';

import { FiltriOccupazione, OccupazioneCameraInterface } from './occupazione-camera-model';

describe('OccupazioneCameraInterface', () => {
  it('una camera senza notti occupate', () => {
    const filtri: FiltriOccupazione = { camera_id: 4 };
    const occupazione: OccupazioneCameraInterface = { occupate: [] };

    expect(filtri.tipologia_id).toBeUndefined();
    expect(occupazione.occupate).toHaveLength(0);
  });
});

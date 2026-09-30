import { describe, expect, it } from 'vitest';

import { ReportRicaviInterface } from './report-ricavi-model';

describe('ReportRicaviInterface', () => {
  it('accetta i ricavi per camera e per tipologia', () => {
    const valore: ReportRicaviInterface = {
      dal: '2026-10-01',
      al: '2026-11-01',
      totale: 1200,
      per_camera: [{ camera_id: 4, numero: '101', prenotazioni: 3, notti: 10, valore: 1200 }],
      per_tipologia: [
        { tipologia_id: 1, nome: 'Doppia', prenotazioni: 3, notti: 10, valore: 1200 },
      ],
    };

    expect(valore.per_camera[0].valore).toBe(valore.totale);
  });
});

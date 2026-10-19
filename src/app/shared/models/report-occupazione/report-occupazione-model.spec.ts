import { describe, expect, it } from 'vitest';

import { ReportOccupazioneInterface } from './report-occupazione-model';

describe('ReportOccupazioneInterface', () => {
  it('accetta un periodo senza giorni', () => {
    const valore: ReportOccupazioneInterface = {
      dal: '2026-10-01',
      al: '2026-10-01',
      riepilogo: {
        notti_disponibili: 0,
        notti_vendute: 0,
        occupazione_percentuale: 0,
        ricavo_camere: 0,
        adr: 0,
        revpar: 0,
      },
      giorni: [],
    };

    expect(valore.riepilogo.revpar).toBe(0);
  });
});

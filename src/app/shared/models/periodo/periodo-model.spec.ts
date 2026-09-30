import { describe, expect, it } from 'vitest';

import { FiltriPeriodo, PeriodoInterface } from './periodo-model';

describe('PeriodoInterface', () => {
  it('accetta un intervallo di date', () => {
    const periodo: PeriodoInterface = { dal: '2026-10-01', al: '2026-10-08' };
    const filtri: FiltriPeriodo = { dal: periodo.dal };

    expect(filtri.al).toBeUndefined();
  });
});

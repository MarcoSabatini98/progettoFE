import { describe, expect, it } from 'vitest';

import { StatisticheFedeltaInterface } from './statistiche-fedelta-model';

describe('StatisticheFedeltaInterface', () => {
  it('accetta i punti tolti come numero positivo', () => {
    const statistiche: StatisticheFedeltaInterface = {
      anno: 2026,
      punti_guadagnati: 320,
      punti_tolti: 50,
    };

    expect(statistiche.punti_tolti).toBeGreaterThan(0);
  });
});

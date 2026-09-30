import { describe, expect, it } from 'vitest';

import { EsitoAssegnazionePulizieInterface } from './esito-assegnazione-pulizie-model';

describe('EsitoAssegnazionePulizieInterface', () => {
  it('accetta attività rimaste senza addetto', () => {
    const esito: EsitoAssegnazionePulizieInterface = { assegnate: 0, non_assegnate: 3 };

    expect(esito.non_assegnate).toBe(3);
  });
});

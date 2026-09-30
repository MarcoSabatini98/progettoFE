import { describe, expect, it } from 'vitest';

import { EsitoGiornataPulizieInterface } from './esito-giornata-pulizie-model';

describe('EsitoGiornataPulizieInterface', () => {
  it('accetta una giornata senza camere occupate', () => {
    const esito: EsitoGiornataPulizieInterface = { riassetti: 0, checklist_aggiunte: 2 };

    expect(esito.riassetti).toBe(0);
  });
});

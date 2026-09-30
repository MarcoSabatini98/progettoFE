import { describe, expect, it } from 'vitest';

import { ClientiPerLivelloInterface } from './clienti-per-livello-model';

describe('ClientiPerLivelloInterface', () => {
  it('accetta il conteggio di un livello', () => {
    const conteggio: ClientiPerLivelloInterface = { livello: 'bronze', count: 42 };

    expect(conteggio.count).toBe(42);
  });
});

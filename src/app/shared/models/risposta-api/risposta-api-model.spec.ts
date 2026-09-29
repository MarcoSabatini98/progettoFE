import { describe, expect, it } from 'vitest';

import { RispostaApiInterface } from './risposta-api-model';

describe('RispostaApiInterface', () => {
  it('accetta una risposta di successo con dati tipizzati', () => {
    const risposta: RispostaApiInterface<{ id: number }> = {
      successo: true,
      dati: { id: 7 },
    };

    expect(risposta.successo).toBe(true);
    expect(risposta.dati.id).toBe(7);
  });
});

import { describe, expect, it } from 'vitest';

import { VisitatoreInterface } from './visitatore-model';

describe('VisitatoreInterface', () => {
  it('accetta un visitatore anonimo', () => {
    const visitatore: VisitatoreInterface = {
      id: 9,
      uuid: '6f1c2b1e-0000-4000-8000-000000000009',
      nome: null,
      email: null,
      lingua: 'en',
      utente_id: null,
      bloccato: false,
      ultimo_accesso_il: null,
      creato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(visitatore.nome).toBeNull();
  });
});

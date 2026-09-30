import { describe, expect, it } from 'vitest';

import { AccessoVisitatoreInterface } from './accesso-visitatore-model';

describe('AccessoVisitatoreInterface', () => {
  it('accetta un visitatore anonimo', () => {
    const accesso: AccessoVisitatoreInterface = {
      token: 'token-chat',
      visitatore: { uuid: '6f1c2b1e-0000-4000-8000-000000000004', nome: null },
    };

    expect(accesso.visitatore.nome).toBeNull();
  });
});

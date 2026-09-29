import { describe, expect, it } from 'vitest';

import { AlloggiatiDocumentoInterface } from './alloggiati-documento-model';

describe('AlloggiatiDocumentoInterface', () => {
  it("accetta la carta d'identità", () => {
    const documento: AlloggiatiDocumentoInterface = {
      codice: 'IDENT',
      descrizione: "CARTA DI IDENTITA'",
    };

    expect(documento.codice).toBe('IDENT');
  });
});

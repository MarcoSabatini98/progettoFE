import { describe, expect, it } from 'vitest';

import { DocumentoOspiteInterface } from './documento-ospite-model';

describe('DocumentoOspiteInterface', () => {
  it('accetta un documento in PDF', () => {
    const documento: DocumentoOspiteInterface = {
      id: 1,
      ospite_id: 1,
      nome_originale: 'carta-identita.pdf',
      percorso: 'documenti/1/abc.pdf',
      tipo_mime: 'application/pdf',
      dimensione: 240_000,
      caricato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(documento.tipo_mime).toBe('application/pdf');
  });
});

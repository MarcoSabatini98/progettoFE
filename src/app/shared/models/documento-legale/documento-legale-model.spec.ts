import { describe, expect, it } from 'vitest';

import { TIPI_DOCUMENTO_LEGALE } from '../../../core/services/sistema/sistema-costanti';
import { DocumentoLegaleInterface } from './documento-legale-model';

describe('DocumentoLegaleInterface', () => {
  it('accetta una bozza di informativa privacy', () => {
    const documento: DocumentoLegaleInterface = {
      id: 1,
      tipo: 'privacy',
      versione: '1.0',
      lingua: 'it',
      contenuto: '<p>Informativa</p>',
      percorso_pdf: null,
      pubblicato_il: null,
      creato_da: 1,
      creato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_DOCUMENTO_LEGALE).toContain(documento.tipo);
    expect(documento.pubblicato_il).toBeNull();
  });
});

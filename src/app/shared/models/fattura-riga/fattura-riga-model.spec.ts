import { describe, expect, it } from 'vitest';

import { FatturaRigaInterface } from './fattura-riga-model';

describe('FatturaRigaInterface', () => {
  it('accetta la tassa di soggiorno esclusa da IVA con la sua natura', () => {
    const riga: FatturaRigaInterface = {
      id: 1,
      fattura_id: 1,
      descrizione: 'Tassa di soggiorno',
      quantita: 1,
      prezzo_unitario: 8,
      aliquota_iva: 0,
      natura: 'N1',
      totale: 8,
      ordine: 2,
    };

    expect(riga.natura).not.toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { IncassoMensileInterface } from './incasso-mensile-model';

describe('IncassoMensileInterface', () => {
  it('accetta un netto negativo per i rimborsi', () => {
    const valore: IncassoMensileInterface = {
      mese: '2026-07',
      metodo: 'contanti',
      movimenti: 2,
      netto: -50,
    };

    expect(valore.netto).toBeLessThan(0);
  });
});

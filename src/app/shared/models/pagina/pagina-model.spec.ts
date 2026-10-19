import { describe, expect, it } from 'vitest';

import { PaginaInterface, ParametriPaginaInterface } from './pagina-model';

describe('PaginaInterface', () => {
  it('accetta una pagina di elementi con i totali', () => {
    const pagina: PaginaInterface<string> = {
      elementi: ['a', 'b'],
      totale: 42,
      pagina: 1,
      perPagina: 20,
      pagine: 3,
    };

    expect(pagina.elementi).toHaveLength(2);
    expect(pagina.pagine).toBe(3);
  });
});

describe('ParametriPaginaInterface', () => {
  it('ammette parametri facoltativi', () => {
    const parametri: ParametriPaginaInterface = { pagina: 2 };
    expect(parametri.perPagina).toBeUndefined();
  });
});

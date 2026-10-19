import { describe, expect, it } from 'vitest';

import { PaginaSitoInterface } from './pagina-sito-model';

describe('PaginaSitoInterface', () => {
  it('accetta una pagina senza descrizione, paragrafo né sezioni', () => {
    const pagina: PaginaSitoInterface = {
      id: 1,
      chiave: 'struttura',
      descrizione: null,
      testo: null,
      aggiornato_il: '2026-10-01T10:00:00.000Z',
      sezioni: [],
    };

    expect(pagina.descrizione).toBeNull();
  });
});

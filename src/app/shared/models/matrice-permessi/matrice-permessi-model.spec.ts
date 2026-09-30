import { describe, expect, it } from 'vitest';

import { MatricePermessiInterface } from './matrice-permessi-model';

describe('MatricePermessiInterface', () => {
  it('accetta ruoli coi soli codici dei permessi', () => {
    const matrice: MatricePermessiInterface = {
      permessi: [
        { codice: 'pulizie.leggi', modulo: 'pulizie', descrizione: 'Vede il piano pulizie' },
      ],
      ruoli: [
        {
          codice: 'housekeeper',
          nome: 'Housekeeper',
          descrizione: null,
          staff: true,
          permessi: ['pulizie.leggi'],
        },
      ],
    };

    expect(matrice.ruoli[0].permessi).toEqual(['pulizie.leggi']);
  });
});

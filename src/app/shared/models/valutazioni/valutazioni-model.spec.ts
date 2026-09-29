import { describe, expect, it } from 'vitest';

import { ValutazioniInterface } from './valutazioni-model';

describe('ValutazioniInterface', () => {
  it('accetta la struttura ancora senza recensioni', () => {
    const valutazioni: ValutazioniInterface = {
      numero_recensioni: 0,
      media: null,
      media_pulizia: null,
      media_personale: null,
      media_posizione: null,
      media_comfort: null,
      media_qualita_prezzo: null,
    };

    expect(valutazioni.media).toBeNull();
  });
});

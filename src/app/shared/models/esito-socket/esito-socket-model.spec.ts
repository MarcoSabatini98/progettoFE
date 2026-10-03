import { describe, expect, it } from 'vitest';

import { EsitoSocketInterface } from './esito-socket-model';

describe('EsitoSocketInterface', () => {
  it('accetta un rifiuto con il codice da tradurre', () => {
    const esito: EsitoSocketInterface = {
      successo: false,
      errore: { codice: 'STATO_PRESENZA_NON_VALIDO', messaggio: 'Stato di presenza non valido' },
    };

    expect(esito.errore?.codice).toBe('STATO_PRESENZA_NON_VALIDO');
  });
});

import { describe, expect, it } from 'vitest';

import { FedeltaUtenteInterface } from './fedelta-utente-model';

describe('FedeltaUtenteInterface', () => {
  it('accetta la situazione fedeltà di un cliente', () => {
    const fedelta: FedeltaUtenteInterface = {
      utente_id: 1,
      punti_fedelta: 350,
      livello_id: 2,
      livello: 'silver',
      livello_nome: 'Silver',
      sconto_percentuale: 5,
      punti_prossimo_livello: 150,
    };

    expect(fedelta.livello).toBe('silver');
  });
});

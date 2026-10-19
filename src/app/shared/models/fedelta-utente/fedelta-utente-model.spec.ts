import { describe, expect, it } from 'vitest';

import { FedeltaUtenteInterface, SituazioneFedeltaInterface } from './fedelta-utente-model';

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

  it('accetta un cliente già al livello più alto', () => {
    const situazione: SituazioneFedeltaInterface = {
      utente_id: 9,
      punti_fedelta: 12000,
      livello_id: 4,
      livello: 'diamond',
      livello_nome: 'Diamond',
      sconto_percentuale: 15,
      punti_prossimo_livello: null,
      punti_mancanti: null,
    };

    expect(situazione.punti_mancanti).toBeNull();
  });
});

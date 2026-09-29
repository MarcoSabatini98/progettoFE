import { describe, expect, it } from 'vitest';

import { STATI_RECENSIONE } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { RecensioneInterface } from './recensione-model';

describe('RecensioneInterface', () => {
  it('accetta una recensione anonima in attesa di moderazione', () => {
    const recensione: RecensioneInterface = {
      id: 1,
      prenotazione_id: 12,
      ospite_id: 1,
      utente_id: 2,
      voto: 5,
      voto_pulizia: 5,
      voto_personale: null,
      voto_posizione: null,
      voto_comfort: null,
      voto_qualita_prezzo: null,
      titolo: 'Tutto perfetto',
      commento: null,
      lingua: 'it',
      anonima: true,
      stato: 'in_attesa',
      moderata_da: null,
      moderata_il: null,
      risposta: null,
      risposta_da: null,
      risposta_il: null,
      creato_il: '2026-10-05T09:00:00.000Z',
      aggiornato_il: '2026-10-05T09:00:00.000Z',
    };

    expect(STATI_RECENSIONE).toContain(recensione.stato);
  });
});

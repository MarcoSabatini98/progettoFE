import { describe, expect, it } from 'vitest';

import { CALCOLO_PREZZO } from '../../../core/services/camere/camere-costanti';
import { PrenotazioneServizioInterface } from './prenotazione-servizio-model';

describe('PrenotazioneServizioInterface', () => {
  it('accetta una colazione a persona per notte', () => {
    const riga: PrenotazioneServizioInterface = {
      prenotazione_id: 12,
      servizio_id: 4,
      quantita: 1,
      prezzo_unitario: 10,
      calcolo_prezzo: 'a_persona_notte',
      totale: 40,
    };

    expect(CALCOLO_PREZZO).toContain(riga.calcolo_prezzo);
  });
});

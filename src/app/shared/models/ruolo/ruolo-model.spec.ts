import { describe, expect, it } from 'vitest';

import { RUOLI } from '../../../core/services/ruoli/ruoli-costanti';
import { RuoloInterface } from './ruolo-model';

describe('RuoloInterface', () => {
  it('accetta un ruolo dello staff con i suoi permessi', () => {
    const ruolo: RuoloInterface = {
      codice: 'receptionist',
      nome: 'Receptionist',
      descrizione: null,
      staff: true,
      permessi: [{ codice: 'checkin.gestisci', modulo: 'prenotazioni', descrizione: 'Check-in' }],
    };

    expect(Object.values(RUOLI)).toContain(ruolo.codice);
    expect(ruolo.permessi).toHaveLength(1);
  });
});

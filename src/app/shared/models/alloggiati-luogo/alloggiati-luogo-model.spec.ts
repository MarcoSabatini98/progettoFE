import { describe, expect, it } from 'vitest';

import {
  CODICE_ITALIA,
  TIPI_LUOGO,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { AlloggiatiLuogoInterface } from './alloggiati-luogo-model';

describe('AlloggiatiLuogoInterface', () => {
  it("accetta l'Italia come stato", () => {
    const luogo: AlloggiatiLuogoInterface = {
      codice: CODICE_ITALIA,
      descrizione: 'ITALIA',
      provincia: null,
      tipo: 'stato',
      soppresso_il: null,
    };

    expect(TIPI_LUOGO).toContain(luogo.tipo);
  });
});

import { describe, expect, it } from 'vitest';

import {
  CODICE_ITALIA,
  TIPI_LUOGO,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import {
  AlloggiatiLuogoInterface,
  FiltriLuoghi,
  LuogoTrovatoInterface,
} from './alloggiati-luogo-model';

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

  it('accetta un comune trovato dalla ricerca', () => {
    const filtri: FiltriLuoghi = { cerca: 'Rom', tipo: 'comune' };
    const luogo: LuogoTrovatoInterface = {
      codice: '412058091',
      descrizione: 'ROMA',
      provincia: 'RM',
      tipo: filtri.tipo!,
    };

    expect(luogo.descrizione.startsWith(filtri.cerca.toUpperCase())).toBe(true);
  });
});

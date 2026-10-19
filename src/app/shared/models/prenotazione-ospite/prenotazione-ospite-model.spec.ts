import { describe, expect, it } from 'vitest';

import {
  TIPI_ALLOGGIATO,
  TIPI_CON_DOCUMENTO,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import {
  PrenotazioneOspiteInterface,
  RigaOspiteInListaInterface,
} from './prenotazione-ospite-model';

describe('PrenotazioneOspiteInterface', () => {
  it('accetta un familiare esente, senza documento nella schedina', () => {
    const riga: PrenotazioneOspiteInterface = {
      prenotazione_id: 12,
      ospite_id: 2,
      tipo_alloggiato: 'familiare',
      esente_tassa: true,
      motivo_esenzione: 'Minore di 14 anni',
    };

    expect(TIPI_ALLOGGIATO).toContain(riga.tipo_alloggiato);
    expect(TIPI_CON_DOCUMENTO).not.toContain(riga.tipo_alloggiato);
  });

  it('in lista accetta un ospite nuovo, senza anagrafica', () => {
    const riga: RigaOspiteInListaInterface = {
      ospite: { nome: 'Luca', cognome: 'Neri' },
      tipo_alloggiato: 'familiare',
      esente_tassa: false,
      motivo_esenzione: null,
    };

    expect(riga.ospite.id).toBeUndefined();
  });
});

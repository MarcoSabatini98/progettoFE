import { describe, expect, it } from 'vitest';

import { TIPI_IMPOSTAZIONE } from '../../../core/services/sistema/sistema-costanti';
import { ImpostazioneInterface } from './impostazione-model';

describe('ImpostazioneInterface', () => {
  it("accetta un'impostazione numerica salvata come testo", () => {
    const impostazione: ImpostazioneInterface = {
      chiave: 'ora_checkin',
      valore: '14',
      tipo: 'numero',
      gruppo: 'soggiorno',
      descrizione: 'Ora di inizio del check-in',
      pubblica: true,
      aggiornato_da: null,
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_IMPOSTAZIONE).toContain(impostazione.tipo);
    expect(Number(impostazione.valore)).toBe(14);
  });
});

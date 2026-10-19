import { describe, expect, it } from 'vitest';

import { TIPI_IMPOSTAZIONE } from '../../../core/services/sistema/sistema-costanti';
import { CAMPI_IMPOSTAZIONI_SPECIALI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { CampoImpostazione, ImpostazioneInterface } from './impostazione-model';

describe('ImpostazioneInterface', () => {
  it("accetta un'impostazione numerica già convertita", () => {
    const impostazione: ImpostazioneInterface = {
      chiave: 'ora_checkin',
      valore: 14,
      tipo: 'numero',
      gruppo: 'soggiorno',
      descrizione: 'Ora di inizio del check-in',
      pubblica: true,
      aggiornato_da: null,
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_IMPOSTAZIONE).toContain(impostazione.tipo);
    expect(impostazione.valore).toBe(14);
  });
});

describe('CampoImpostazione', () => {
  it('comprende i controlli appositi e quelli dei tipi', () => {
    const campi: CampoImpostazione[] = [
      ...Object.values(CAMPI_IMPOSTAZIONI_SPECIALI),
      'spunta',
      'numero',
      'testo',
    ];

    expect(campi).toContain('colore');
    expect(campi).toContain('lingue');
  });
});

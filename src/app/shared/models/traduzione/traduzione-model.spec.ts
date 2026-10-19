import { describe, expect, it } from 'vitest';

import { CAMPI_TRADUCIBILI } from '../../../core/services/sistema/sistema-costanti';
import { TraduzioneInterface, TraduzioniPayload } from './traduzione-model';

describe('TraduzioneInterface', () => {
  it('accetta un campo traducibile della sua entità', () => {
    const traduzione: TraduzioneInterface = {
      id: 1,
      entita: 'faq',
      entita_id: 3,
      campo: 'domanda',
      lingua: 'en',
      testo: 'What time is check-in?',
    };

    expect(CAMPI_TRADUCIBILI[traduzione.entita]).toContain(traduzione.campo);
  });

  it('accetta null per eliminare una traduzione', () => {
    const payload: TraduzioniPayload = { en: { domanda: null } };

    expect(payload.en?.['domanda']).toBeNull();
  });
});

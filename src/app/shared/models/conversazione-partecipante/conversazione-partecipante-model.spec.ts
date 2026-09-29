import { describe, expect, it } from 'vitest';

import { ConversazionePartecipanteInterface } from './conversazione-partecipante-model';

describe('ConversazionePartecipanteInterface', () => {
  it('accetta un partecipante presente che non ha ancora letto', () => {
    const partecipante: ConversazionePartecipanteInterface = {
      conversazione_id: 1,
      utente_id: 3,
      uscito_il: null,
      letto_fino_al: null,
      entrato_il: '2026-10-03T08:00:00.000Z',
    };

    expect(partecipante.uscito_il).toBeNull();
  });
});

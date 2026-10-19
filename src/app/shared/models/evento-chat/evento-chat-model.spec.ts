import { describe, expect, it } from 'vitest';

import { EventoScriveInterface, PresenzaInterface } from './evento-chat-model';

describe('Eventi della chat', () => {
  it('accetta un collega che sta scrivendo', () => {
    const evento: EventoScriveInterface = {
      conversazione: '6f1c2b1e-0000-4000-8000-000000000031',
      utente_id: 2,
      visitatore_id: null,
      attivo: true,
    };

    expect(evento.attivo).toBe(true);
  });

  it('accetta la presenza di un collega', () => {
    const presenza: PresenzaInterface = { utente_id: 2, stato: 'assente' };

    expect(presenza.stato).toBe('assente');
  });
});

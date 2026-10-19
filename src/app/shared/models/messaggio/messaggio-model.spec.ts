import { describe, expect, it } from 'vitest';

import { ALLEGATI_MAX, TESTO_MAX } from '../../../core/services/chat/chat-costanti';
import { InviaMessaggioPayload, MessaggioInterface } from './messaggio-model';

describe('MessaggioInterface', () => {
  it('accetta un messaggio di un visitatore entro la lunghezza massima', () => {
    const messaggio: MessaggioInterface = {
      id: 7,
      conversazione_id: 1,
      mittente_utente_id: null,
      mittente_visitatore_id: 4,
      di_sistema: false,
      risposta_a_id: null,
      testo: 'Avete il parcheggio?',
      modificato_il: null,
      inviato_il: '2026-10-03T08:00:00.000Z',
      eliminato_il: null,
    };

    expect(messaggio.testo.length).toBeLessThanOrEqual(TESTO_MAX);
  });

  it('accetta un messaggio di soli allegati', () => {
    const invio: InviaMessaggioPayload = { allegati: [new File(['x'], 'foto.jpg')] };

    expect(invio.allegati?.length).toBeLessThanOrEqual(ALLEGATI_MAX);
  });
});

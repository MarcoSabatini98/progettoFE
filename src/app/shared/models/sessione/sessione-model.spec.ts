import { describe, expect, it } from 'vitest';

import { SessioneInterface } from './sessione-model';

describe('SessioneInterface', () => {
  it('accetta la sessione con utente e permessi', () => {
    const sessione: SessioneInterface = {
      accessToken: 'eyJhbGciOi...',
      utente: {
        id: 3,
        uuid: '6f1c2b1e-0000-4000-8000-000000000003',
        email: 'reception@example.com',
        nome: 'Luca',
        cognome: 'Bianchi',
        ruolo: 'receptionist',
        lingua: 'it',
        colore_avatar: null,
        email_verificata: true,
        permessi: ['prenotazioni.leggi', 'checkin.gestisci'],
      },
    };

    // Il refresh token non fa parte del corpo: viaggia solo nel cookie.
    expect(sessione).not.toHaveProperty('refreshToken');
    expect(sessione.utente.permessi).toContain('checkin.gestisci');
  });
});

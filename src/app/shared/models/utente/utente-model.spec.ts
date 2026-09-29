import { describe, expect, it } from 'vitest';

import { UtenteInterface } from './utente-model';

describe('UtenteInterface', () => {
  it('accetta un cliente senza associazioni', () => {
    const utente: UtenteInterface = {
      id: 1,
      uuid: '6f1c2b1e-0000-4000-8000-000000000001',
      email: 'giulia@example.com',
      ruolo: 'cliente',
      nome: 'Giulia',
      cognome: 'Rossi',
      telefono: null,
      lingua: 'it',
      attivo: true,
      email_verificata_il: '2026-09-01T10:00:00.000Z',
      notifiche_email: true,
      punti_fedelta: 120,
      ospite_id: null,
      ultimo_accesso_il: null,
      colore_avatar: 'hsl(210 55% 45%)',
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
      eliminato_il: null,
    };

    expect(utente.ruolo).toBe('cliente');
    expect(utente.dettagli_ruolo).toBeUndefined();
  });
});

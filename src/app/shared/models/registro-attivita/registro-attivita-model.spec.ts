import { describe, expect, it } from 'vitest';

import { RegistroAttivitaInterface } from './registro-attivita-model';

describe('RegistroAttivitaInterface', () => {
  it('accetta una modifica con i dati prima e dopo', () => {
    const riga: RegistroAttivitaInterface = {
      id: 1,
      tabella: 'prenotazioni',
      record_id: 12,
      azione: 'modifica',
      dati_prima: { stato: 'in_attesa' },
      dati_dopo: { stato: 'confermata' },
      utente_id: 3,
      ip: '127.0.0.1',
      creato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(riga.dati_dopo?.['stato']).toBe('confermata');
  });
});

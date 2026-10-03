import { describe, expect, it } from 'vitest';

import { STATI_CONVERSAZIONE, TIPI_CONVERSAZIONE } from '../../../core/services/chat/chat-costanti';
import {
  ChatStaffCreaPayload,
  CollegaInterface,
  ConversazioneInterface,
} from './conversazione-model';

describe('ConversazioneInterface', () => {
  it("accetta un'assistenza aperta di un visitatore non ancora presa", () => {
    const conversazione: ConversazioneInterface = {
      id: 1,
      uuid: '6f1c2b1e-0000-4000-8000-000000000031',
      tipo: 'assistenza',
      titolo: null,
      cliente_id: null,
      visitatore_id: 4,
      prenotazione_id: null,
      assegnata_a: null,
      stato: 'aperta',
      letto_cliente_il: null,
      ultimo_messaggio_il: '2026-10-03T08:00:00.000Z',
      creata_da: null,
      creato_il: '2026-10-03T08:00:00.000Z',
      aggiornato_il: '2026-10-03T08:00:00.000Z',
    };

    expect(TIPI_CONVERSAZIONE).toContain(conversazione.tipo);
    expect(STATI_CONVERSAZIONE).toContain(conversazione.stato);
  });

  it('accetta un gruppo dello staff con titolo', () => {
    const gruppo: ChatStaffCreaPayload = {
      partecipanti: [2, 3],
      titolo: 'Turno di sabato',
      testo: 'Chi copre la reception?',
    };

    expect(gruppo.partecipanti.length).toBeGreaterThan(1);
  });

  it('accetta un collega con la sua presenza', () => {
    const collega: CollegaInterface = {
      id: 2,
      nome: 'Luca',
      cognome: 'Verdi',
      ruolo: 'receptionist',
      presenza: 'occupato',
    };

    expect(collega.presenza).toBe('occupato');
  });
});

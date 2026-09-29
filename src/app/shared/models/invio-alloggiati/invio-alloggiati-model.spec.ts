import { describe, expect, it } from 'vitest';

import { ESITI_ALLOGGIATI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { InvioAlloggiatiInterface } from './invio-alloggiati-model';

describe('InvioAlloggiatiInterface', () => {
  it('accetta un invio rifiutato con il messaggio del portale', () => {
    const invio: InvioAlloggiatiInterface = {
      id: 1,
      prenotazione_id: 12,
      ospite_id: 1,
      schedina: '16...',
      esito: 'errore',
      messaggio: 'Documento non valido',
      inviato_da: 3,
      inviato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(ESITI_ALLOGGIATI).toContain(invio.esito);
  });
});

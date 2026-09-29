import { describe, expect, it } from 'vitest';

import { CALCOLO_PREZZO, TIPI_SERVIZIO } from '../../../core/services/camere/camere-costanti';
import { ServizioInterface } from './servizio-model';

describe('ServizioInterface', () => {
  it('accetta un extra a persona per notte', () => {
    const servizio: ServizioInterface = {
      id: 5,
      nome: 'Colazione',
      descrizione: null,
      icona: 'coffee',
      tipo: 'extra',
      prezzo: 12.5,
      calcolo_prezzo: 'a_persona_notte',
      aliquota_iva: 10,
      ordine: 1,
      attivo: true,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
      eliminato_il: null,
    };

    expect(TIPI_SERVIZIO).toContain(servizio.tipo);
    expect(CALCOLO_PREZZO).toContain(servizio.calcolo_prezzo);
  });
});

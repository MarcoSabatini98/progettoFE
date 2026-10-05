import { describe, expect, it } from 'vitest';

import { PRIORITA_NOTIFICA, TIPI_NOTIFICA } from '../../../core/services/sistema/sistema-costanti';
import { NotificaInterface, PaginaNotificheInterface } from './notifica-model';

describe('NotificaInterface', () => {
  it('accetta una notifica non letta', () => {
    const notifica: NotificaInterface = {
      id: 10,
      utente_id: 3,
      tipo: 'prenotazione',
      priorita: 'info',
      codice: 'pulizia_assegnata',
      parametri: { camera: '101', data: '2026-10-12' },
      titolo: 'Pulizia assegnata: camera 101 per il 2026-10-12',
      testo: null,
      link: null,
      letta_il: null,
      creato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(TIPI_NOTIFICA).toContain(notifica.tipo);
    expect(PRIORITA_NOTIFICA).toContain(notifica.priorita);
    expect(notifica.letta_il).toBeNull();
  });

  it('accetta una pagina vuota con il contatore', () => {
    const pagina: PaginaNotificheInterface = {
      elementi: [],
      totale: 0,
      pagina: 1,
      perPagina: 20,
      pagine: 0,
      non_lette: 0,
    };

    expect(pagina.non_lette).toBe(0);
  });
});

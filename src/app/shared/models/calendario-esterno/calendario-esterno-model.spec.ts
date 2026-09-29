import { describe, expect, it } from 'vitest';

import { CANALI_OTA } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CalendarioEsternoInterface } from './calendario-esterno-model';

describe('CalendarioEsternoInterface', () => {
  it('accetta un calendario Airbnb mai sincronizzato', () => {
    const calendario: CalendarioEsternoInterface = {
      id: 1,
      camera_id: 1,
      canale: 'airbnb',
      nome: null,
      url: 'https://www.airbnb.it/calendar/ical/123.ics',
      attivo: true,
      ultima_sincronizzazione_il: null,
      ultimo_esito: null,
      errori_consecutivi: 0,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(CANALI_OTA).toContain(calendario.canale);
  });
});

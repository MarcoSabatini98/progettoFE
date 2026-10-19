import { describe, expect, it } from 'vitest';

import {
  STATI_SEGNALAZIONE,
  STATI_SEGNALAZIONE_APERTA,
} from '../../../core/services/pulizie/pulizie-costanti';
import {
  SegnalazioneCreaPayload,
  SegnalazioneManutenzioneInterface,
} from './segnalazione-manutenzione-model';

describe('SegnalazioneManutenzioneInterface', () => {
  it('accetta un guasto aperto in area comune', () => {
    const segnalazione: SegnalazioneManutenzioneInterface = {
      id: 1,
      camera_id: null,
      titolo: 'Luce del corridoio',
      descrizione: null,
      priorita: 'normale',
      stato: 'aperta',
      segnalata_da: 5,
      assegnata_a: null,
      risolta_il: null,
      note_risoluzione: null,
      creato_il: '2026-10-03T08:00:00.000Z',
      aggiornato_il: '2026-10-03T08:00:00.000Z',
    };

    expect(STATI_SEGNALAZIONE).toContain(segnalazione.stato);
    expect(STATI_SEGNALAZIONE_APERTA).toContain(segnalazione.stato);
  });

  it('accetta un guasto che mette la camera fuori servizio', () => {
    const guasto: SegnalazioneCreaPayload = {
      camera_id: 4,
      titolo: 'Perdita dal lavandino',
      priorita: 'alta',
      stato_camera: 'fuori_servizio',
    };

    expect(guasto.stato_camera).toBe('fuori_servizio');
  });
});

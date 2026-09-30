import { describe, expect, it } from 'vitest';

import {
  CANALI,
  STATI_PRENOTAZIONE,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import {
  FiltriPrenotazioni,
  PrenotazioneCreaPayload,
  PrenotazioneInterface,
} from './prenotazione-model';

describe('PrenotazioneInterface', () => {
  it('accetta una prenotazione diretta confermata', () => {
    const prenotazione: PrenotazioneInterface = {
      id: 12,
      uuid: '6f1c2b1e-0000-4000-8000-000000000012',
      codice: 'BB-2026-0012',
      ospite_id: 1,
      utente_id: 2,
      camera_id: 3,
      piano_tariffario_id: 1,
      promozione_id: null,
      codice_sconto_id: null,
      pacchetto_id: null,
      data_arrivo: '2026-10-01',
      data_partenza: '2026-10-03',
      notti: 2,
      adulti: 2,
      bambini: 0,
      stato: 'confermata',
      canale: 'diretto',
      id_esterno: null,
      valuta: 'EUR',
      importo_soggiorno: 200,
      sconto_promozione: 0,
      sconto_codice: 0,
      percentuale_fedelta: 0,
      sconto_fedelta: 0,
      importo_pacchetto: 0,
      importo_servizi: 0,
      tassa_soggiorno: 8,
      totale: 208,
      acconto_richiesto: 60,
      dettaglio_prezzo: null,
      rimborsabile: true,
      ore_cancellazione_gratuita: 48,
      penale_percentuale: 30,
      richieste_speciali: null,
      ora_arrivo_prevista: '15:00:00',
      scade_il: null,
      checkin_online_il: null,
      arrivo_effettivo_il: null,
      partenza_effettiva_il: null,
      cancellata_il: null,
      motivo_cancellazione: null,
      penale_applicata: 0,
      creato_da: null,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(STATI_PRENOTAZIONE).toContain(prenotazione.stato);
    expect(CANALI).toContain(prenotazione.canale);
  });

  it('accetta una prenotazione telefonica dello staff', () => {
    const richiesta: PrenotazioneCreaPayload = {
      camera_id: 3,
      arrivo: '2026-10-01',
      partenza: '2026-10-03',
      adulti: 2,
      titolare: { nome: 'Anna', cognome: 'Rossi' },
      canale: 'telefono',
      stato: 'confermata',
    };
    const filtri: FiltriPrenotazioni = { stato: ['confermata', 'in_soggiorno'], ordine: 'desc' };

    expect(CANALI).toContain(richiesta.canale);
    expect(filtri.stato).toHaveLength(2);
  });
});

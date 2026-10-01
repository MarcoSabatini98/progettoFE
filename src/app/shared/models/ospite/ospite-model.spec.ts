import { describe, expect, it } from 'vitest';

import { SESSI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { OspiteInterface, SchedaOspiteInterface } from './ospite-model';

describe('OspiteInterface', () => {
  // Nome e cognome bastano alla prenotazione; il resto arriva col check-in.
  const ospite: OspiteInterface = {
    id: 1,
    uuid: '6f1c2b1e-0000-4000-8000-000000000011',
    utente_id: null,
    nome: 'Anna',
    cognome: 'Verdi',
    email: 'anna@example.com',
    telefono: null,
    sesso: 'F',
    data_nascita: null,
    cittadinanza_codice: null,
    stato_nascita_codice: null,
    comune_nascita_codice: null,
    provincia_nascita: null,
    tipo_documento: null,
    numero_documento: null,
    luogo_rilascio_codice: null,
    scadenza_documento: null,
    codice_fiscale: null,
    indirizzo: null,
    cap: null,
    citta: null,
    provincia: null,
    paese: 'IT',
    lingua: 'it',
    note: null,
    creato_il: '2026-09-01T10:00:00.000Z',
    aggiornato_il: '2026-09-01T10:00:00.000Z',
    eliminato_il: null,
  };

  it('accetta un ospite con i soli dati minimi', () => {
    expect(SESSI).toContain(ospite.sesso);
  });

  it('la scheda dello staff dice cosa manca per la schedina', () => {
    const scheda: SchedaOspiteInterface = { ...ospite, campi_mancanti: ['data_nascita'] };

    expect(scheda.campi_mancanti).toEqual(['data_nascita']);
  });
});

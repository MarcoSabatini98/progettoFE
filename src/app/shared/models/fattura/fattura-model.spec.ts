import { describe, expect, it } from 'vitest';

import {
  STATI_SDI,
  TIPI_DOCUMENTO_FATTURA,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { FatturaAggiornaPayload, FatturaInterface } from './fattura-model';

describe('FatturaInterface', () => {
  it('accetta una bozza ancora senza anno e numero', () => {
    const bozza: FatturaInterface = {
      id: 1,
      prenotazione_id: 12,
      fattura_origine_id: null,
      tipo_documento: 'TD01',
      anno: null,
      sezionale: 'A',
      numero: null,
      data_emissione: '2026-10-03',
      cliente_denominazione: null,
      cliente_nome: 'Anna',
      cliente_cognome: 'Verdi',
      cliente_codice_fiscale: 'VRDNNA80A41H501X',
      cliente_partita_iva: null,
      cliente_indirizzo: 'Via Roma 1',
      cliente_cap: '00100',
      cliente_comune: 'Roma',
      cliente_provincia: 'RM',
      cliente_nazione: 'IT',
      codice_destinatario: '0000000',
      pec: null,
      imponibile: 181.82,
      imposta: 18.18,
      importo_esente: 8,
      totale: 208,
      stato_sdi: 'bozza',
      id_sdi: null,
      nome_file_xml: null,
      percorso_xml: null,
      percorso_pdf: null,
      esito_sdi: null,
      note: null,
      creato_da: 3,
      creato_il: '2026-10-03T09:00:00.000Z',
      aggiornato_il: '2026-10-03T09:00:00.000Z',
    };

    expect(TIPI_DOCUMENTO_FATTURA).toContain(bozza.tipo_documento);
    expect(STATI_SDI).toContain(bozza.stato_sdi);
    expect(bozza.numero).toBeNull();
  });

  it("accetta i dati di un'azienda e una riga di sconto", () => {
    const modifiche: FatturaAggiornaPayload = {
      cliente: {
        denominazione: 'Rossi Srl',
        partita_iva: '01234567890',
        codice_destinatario: 'ABC1234',
      },
      righe: [{ descrizione: 'Sconto', prezzo_unitario: -10, aliquota_iva: 10 }],
    };

    expect(modifiche.righe?.[0].prezzo_unitario).toBeLessThan(0);
  });
});

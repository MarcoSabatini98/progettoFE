import { describe, expect, it } from 'vitest';

import { PreventivoInterface, PreventivoPayload } from './preventivo-model';

describe('PreventivoInterface', () => {
  it('accetta un preventivo senza sconti né extra', () => {
    const richiesta: PreventivoPayload = {
      tipologia_id: 1,
      arrivo: '2026-10-01',
      partenza: '2026-10-03',
      adulti: 2,
    };
    const preventivo: PreventivoInterface = {
      notti: [
        { data: '2026-10-01', prezzo: 90, periodo: null },
        { data: '2026-10-02', prezzo: 90, periodo: null },
      ],
      promozione: null,
      codice_sconto: null,
      pacchetto: null,
      numero_notti: 2,
      importo_soggiorno: 180,
      sconto_promozione: 0,
      sconto_codice: 0,
      percentuale_fedelta: 0,
      sconto_fedelta: 0,
      importo_pacchetto: 0,
      servizi: [],
      importo_servizi: 0,
      tassa_soggiorno: 8,
      totale: 188,
      acconto_richiesto: 54,
      tipologia: { id: richiesta.tipologia_id, nome: 'Doppia' },
      piano: null,
    };

    expect(preventivo.numero_notti).toBe(preventivo.notti.length);
  });
});

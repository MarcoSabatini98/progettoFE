import { describe, expect, it } from 'vitest';

import { PreventivoInterface } from '../preventivo/preventivo-model';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';
import { SceltaSoggiornoInterface } from './scelta-soggiorno-model';

describe('SceltaSoggiornoInterface', () => {
  it('unisce tipologia, preventivo, ricerca e blocco', () => {
    const scelta: SceltaSoggiornoInterface = {
      tipologia: { id: 1, nome: 'Doppia' } as TipologiaCameraInterface,
      preventivo: { totale: 300, numero_notti: 3 } as PreventivoInterface,
      filtri: { arrivo: '2026-10-01', partenza: '2026-10-04', adulti: 2 },
      blocco: { sessione: 'abc', camera_id: 4, scade_il: '2026-09-30T10:15:00Z' },
    };

    expect(scelta.blocco.camera_id).toBe(4);
  });
});

import { describe, expect, it } from 'vitest';

import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';
import { DisponibilitaInterface, FiltriDisponibilita } from './disponibilita-model';

describe('DisponibilitaInterface', () => {
  it('accetta una tipologia libera ma non prenotabile', () => {
    const filtri: FiltriDisponibilita = {
      arrivo: '2026-10-01',
      partenza: '2026-10-02',
      adulti: 2,
      eta_bambini: [4],
    };
    const voce: DisponibilitaInterface = {
      tipologia: { id: 1, nome: 'Doppia' } as TipologiaCameraInterface,
      camere_libere: 3,
      preventivo: null,
      non_prenotabile: { codice: 'SOGGIORNO_MINIMO', messaggio: 'Minimo 2 notti' },
    };

    expect(filtri.eta_bambini).toHaveLength(1);
    expect(voce.non_prenotabile?.codice).toBe('SOGGIORNO_MINIMO');
  });
});

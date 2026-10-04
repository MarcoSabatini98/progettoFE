import { describe, expect, it } from 'vitest';

import { OccupazioneGiornoInterface } from '../../../shared/models/occupazione-giorno/occupazione-giorno-model';
import {
  intervallo,
  intervalloPrecedente,
  mediaPerGiornoSettimana,
  perMese,
  raggruppa,
  variazione,
} from './andamento';

/** Domenica 4 ottobre 2026. */
const OGGI = new Date(2026, 9, 4);

function giorno(data: string, occupate: number, ricavo: number): OccupazioneGiornoInterface {
  return {
    giorno: data,
    camere_disponibili: 4,
    camere_occupate: occupate,
    occupazione_percentuale: occupate * 25,
    ricavo_camere: ricavo,
    prezzo_medio: occupate ? ricavo / occupate : 0,
  };
}

describe('andamento', () => {
  it('la settimana va da lunedì a lunedì escluso, anche di domenica', () => {
    expect(intervallo('settimana', OGGI)).toEqual({ dal: '2026-09-28', al: '2026-10-05' });
    expect(intervallo('settimanaScorsa', OGGI)).toEqual({ dal: '2026-09-21', al: '2026-09-28' });
  });

  it('mese e anno partono dal primo, il precedente è un periodo prima', () => {
    expect(intervallo('mese', OGGI)).toEqual({ dal: '2026-10-01', al: '2026-11-01' });
    expect(intervalloPrecedente('meseScorso', OGGI)).toEqual({
      dal: '2026-08-01',
      al: '2026-09-01',
    });
    expect(intervalloPrecedente('anno', OGGI)).toEqual({ dal: '2025-01-01', al: '2026-01-01' });
  });

  it("nell'anno raggruppa per mese pesando le notti, altrimenti per giorno", () => {
    const giorni = [
      giorno('2026-01-30', 4, 400),
      giorno('2026-01-31', 0, 0),
      giorno('2026-02-01', 1, 90.5),
    ];

    expect(perMese('anno')).toBe(true);
    expect(raggruppa(giorni, true)).toEqual([
      { inizio: '2026-01-01', occupazione: 50, ricavo: 400 },
      { inizio: '2026-02-01', occupazione: 25, ricavo: 90.5 },
    ]);
    expect(raggruppa(giorni, perMese('mese'))).toHaveLength(3);
  });

  it('fa la media per giorno della settimana partendo da lunedì', () => {
    const medie = mediaPerGiornoSettimana([giorno('2026-09-28', 4, 0), giorno('2026-10-04', 1, 0)]);

    expect(medie).toEqual([100, 0, 0, 0, 0, 0, 25]);
  });

  it('senza periodo precedente non c’è variazione', () => {
    expect(variazione(120, 100)).toBeCloseTo(0.2);
    expect(variazione(50, 0)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { StatisticaCanaleInterface } from './statistica-canale-model';

describe('StatisticaCanaleInterface', () => {
  it('accetta le statistiche del sito diretto', () => {
    const valore: StatisticaCanaleInterface = {
      canale: 'diretto',
      prenotazioni: 10,
      cancellate: 1,
      no_show: 0,
      notti: 27,
      valore: 2700,
      durata_media: 3,
      anticipo_medio_giorni: 21.5,
    };

    expect(valore.canale).toBe('diretto');
  });
});

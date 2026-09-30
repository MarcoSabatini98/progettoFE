import { describe, expect, it } from 'vitest';

import { CruscottoInterface } from './cruscotto-model';

describe('CruscottoInterface', () => {
  it('accetta la percentuale di occupazione di oggi', () => {
    const valore: CruscottoInterface = {
      arrivi_oggi: 3,
      partenze_oggi: 2,
      in_casa: 6,
      camere: 8,
      occupazione_oggi: 75,
      da_confermare: 1,
      manutenzioni_aperte: 0,
      recensioni_da_moderare: 2,
      incassato_mese: 4200.5,
      prenotato_da_inizio_mese: 9800,
    };

    expect(valore.occupazione_oggi).toBe((valore.in_casa * 100) / valore.camere);
  });
});

import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import {
  dataCalendario,
  giornoDopo,
  giorniTra,
  partenzaDopoArrivo,
  spostaData,
} from './date-soggiorno';

describe('date del soggiorno', () => {
  it('scrive la data locale come AAAA-MM-GG', () => {
    expect(dataCalendario(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('passa al giorno dopo anche a fine mese e fine anno', () => {
    expect(giornoDopo('2026-02-28')).toBe('2026-03-01');
    expect(giornoDopo('2026-12-31')).toBe('2027-01-01');
  });

  it('sposta una data avanti e indietro e conta i giorni, anche col cambio d’ora', () => {
    expect(spostaData('2026-03-01', -1)).toBe('2026-02-28');
    expect(spostaData('2026-10-20', 14)).toBe('2026-11-03');
    expect(giorniTra('2026-10-20', '2026-11-03')).toBe(14);
    expect(giorniTra('2026-03-30', '2026-03-28')).toBe(-2);
  });

  it('segnala una partenza uguale o precedente all’arrivo', () => {
    const date = new FormGroup(
      { arrivo: new FormControl('2026-10-03'), partenza: new FormControl('2026-10-03') },
      { validators: partenzaDopoArrivo },
    );
    expect(date.errors).toEqual({ partenzaPrimaArrivo: true });

    date.controls.partenza.setValue('2026-10-04');
    expect(date.errors).toBeNull();

    date.controls.partenza.setValue('');
    expect(date.errors).toBeNull();
  });
});

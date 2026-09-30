import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { dataCalendario, giornoDopo, partenzaDopoArrivo } from './date-soggiorno';

describe('date del soggiorno', () => {
  it('scrive la data locale come AAAA-MM-GG', () => {
    expect(dataCalendario(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('passa al giorno dopo anche a fine mese e fine anno', () => {
    expect(giornoDopo('2026-02-28')).toBe('2026-03-01');
    expect(giornoDopo('2026-12-31')).toBe('2027-01-01');
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

import { TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { IntestatarioFatturaComponent, moduloIntestatario } from './intestatario-fattura-component';

describe('IntestatarioFatturaComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  const nuovo = () => moduloIntestatario(TestBed.inject(NonNullableFormBuilder));

  it('parte in Italia, con la fattura nel cassetto fiscale', async () => {
    const fixture = TestBed.createComponent(IntestatarioFatturaComponent);
    fixture.componentRef.setInput('gruppo', nuovo());
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const valore = (nome: string) =>
      elemento.querySelector<HTMLInputElement>(`[formControlName=${nome}]`)!.value;

    expect(valore('nazione')).toBe('IT');
    expect(valore('codice_destinatario')).toBe('0000000');
    expect(elemento.querySelectorAll('input')).toHaveLength(12);
  });

  it('vuole sigle di due lettere, un codice destinatario di sette caratteri e una PEC valida', () => {
    const gruppo = nuovo();
    expect(gruppo.valid).toBe(true);

    gruppo.patchValue({ provincia: 'Roma', nazione: '', codice_destinatario: '123', pec: 'no' });

    const { provincia, nazione, codice_destinatario, pec } = gruppo.controls;
    expect([provincia, nazione, codice_destinatario, pec].every((c) => c.invalid)).toBe(true);
  });
});

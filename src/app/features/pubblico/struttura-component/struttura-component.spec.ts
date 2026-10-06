import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { StrutturaComponent } from './struttura-component';

describe('StrutturaComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          struttura: { titolo: 'La struttura' },
          layout: { paginaInArrivo: 'In arrivo' },
        }),
      ],
    });
  });

  it('mostra il titolo e avvisa che i contenuti sono in arrivo', async () => {
    const fixture = TestBed.createComponent(StrutturaComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('h1')?.textContent).toContain('La struttura');
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('In arrivo');
  });
});

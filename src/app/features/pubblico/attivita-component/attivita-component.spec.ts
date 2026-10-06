import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { AttivitaComponent } from './attivita-component';

describe('AttivitaComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          attivita: { titolo: 'Le attività' },
          layout: { paginaInArrivo: 'In arrivo' },
        }),
      ],
    });
  });

  it('mostra il titolo e avvisa che i contenuti sono in arrivo', async () => {
    const fixture = TestBed.createComponent(AttivitaComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('h1')?.textContent).toContain('Le attività');
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('In arrivo');
  });
});

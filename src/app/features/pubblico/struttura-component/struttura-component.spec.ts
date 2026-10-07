import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { StrutturaComponent } from './struttura-component';

describe('StrutturaComponent', () => {
  const contenuti = { leggiPaginaPubblica: vi.fn(() => of({ sezioni: [] })) };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ struttura: { titolo: 'La struttura' } })],
      providers: [
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  it('mostra la pagina "struttura" scritta dallo staff', async () => {
    const fixture = TestBed.createComponent(StrutturaComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(contenuti.leggiPaginaPubblica).toHaveBeenCalledWith('struttura', 'it');
    expect(elemento.querySelector('h1')?.textContent).toBe('La struttura');
  });
});

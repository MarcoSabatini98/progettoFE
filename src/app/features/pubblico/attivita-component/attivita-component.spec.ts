import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { AttivitaComponent } from './attivita-component';

describe('AttivitaComponent', () => {
  const contenuti = { leggiPaginaPubblica: vi.fn(() => of({ sezioni: [] })) };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ attivita: { titolo: 'Le attività' } })],
      providers: [
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  it('mostra la pagina "attivita" scritta dallo staff', async () => {
    const fixture = TestBed.createComponent(AttivitaComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(contenuti.leggiPaginaPubblica).toHaveBeenCalledWith('attivita', 'it');
    expect(elemento.querySelector('h1')?.textContent).toBe('Le attività');
  });
});

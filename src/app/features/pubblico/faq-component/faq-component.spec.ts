import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { FaqInterface } from '../../../shared/models/faq/faq-model';
import { FaqComponent } from './faq-component';

describe('FaqComponent', () => {
  const contenuti = { elencaFaqPubbliche: vi.fn() };
  const domanda = (id: number, categoria: string | null) =>
    ({ id, categoria, domanda: `Domanda ${id}`, risposta: `Risposta ${id}` }) as FaqInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'en' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(FaqComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('raggruppa le domande per categoria nella lingua attiva', async () => {
    contenuti.elencaFaqPubbliche.mockReturnValue(
      of([domanda(1, 'Arrivo'), domanda(2, 'Pagamenti'), domanda(3, 'Arrivo'), domanda(4, null)]),
    );

    const elemento = await crea();

    expect(contenuti.elencaFaqPubbliche).toHaveBeenCalledWith('en');
    expect([...elemento.querySelectorAll('h2.sezione-titolo')].map((h) => h.textContent)).toEqual([
      'Arrivo',
      'Pagamenti',
    ]);
    const primoGruppo = elemento.querySelectorAll('.sezione')[0];
    expect([...primoGruppo.querySelectorAll('summary')].map((s) => s.textContent?.trim())).toEqual([
      'Domanda 1',
      'Domanda 3',
    ]);
    expect(elemento.querySelectorAll('details')).toHaveLength(4);
  });

  it('senza domande lo dice e rimanda ai contatti', async () => {
    contenuti.elencaFaqPubbliche.mockReturnValue(of([]));

    const elemento = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('faq.nessuna');
    expect(elemento.querySelector('.altre-domande a')?.getAttribute('href')).toBe('/contatti');
  });

  it('se il backend non risponde mostra un errore', async () => {
    contenuti.elencaFaqPubbliche.mockReturnValue(throwError(() => new Error('500')));

    const elemento = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
  });
});

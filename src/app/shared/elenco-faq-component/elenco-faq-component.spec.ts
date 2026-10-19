import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { FaqInterface } from '../models/faq/faq-model';
import { ElencoFaqComponent } from './elenco-faq-component';

describe('ElencoFaqComponent', () => {
  const contenuti = { elencaFaqPubbliche: vi.fn() };
  const domanda = (id: number, categoria: string | null) =>
    ({ id, categoria, domanda: `Domanda ${id}`, risposta: `Risposta ${id}` }) as FaqInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'en' } },
      ],
    });
  });

  async function crea(livello?: number) {
    const fixture = TestBed.createComponent(ElencoFaqComponent);
    if (livello) {
      fixture.componentRef.setInput('livello', livello);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('raggruppa le domande per categoria nella lingua attiva', async () => {
    contenuti.elencaFaqPubbliche.mockReturnValue(
      of([domanda(1, 'Arrivo'), domanda(2, 'Pagamenti'), domanda(3, 'Arrivo'), domanda(4, null)]),
    );

    const elemento = await crea(3);

    expect(contenuti.elencaFaqPubbliche).toHaveBeenCalledWith('en');
    const categorie = [...elemento.querySelectorAll('.categoria')];
    expect(categorie.map((c) => c.textContent?.trim())).toEqual(['Arrivo', 'Pagamenti']);
    expect(categorie[0].getAttribute('aria-level')).toBe('3');
    const primoGruppo = elemento.querySelectorAll('.gruppo')[0];
    expect([...primoGruppo.querySelectorAll('summary')].map((s) => s.textContent?.trim())).toEqual([
      'Domanda 1',
      'Domanda 3',
    ]);
    expect(elemento.querySelectorAll('details')).toHaveLength(4);
  });

  it('senza domande lo dice', async () => {
    contenuti.elencaFaqPubbliche.mockReturnValue(of([]));

    expect((await crea()).querySelector('.stato-vuoto')?.textContent).toContain('faq.nessuna');
  });

  it('se il backend non risponde mostra un errore', async () => {
    contenuti.elencaFaqPubbliche.mockReturnValue(throwError(() => new Error('500')));

    expect((await crea()).querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
  });
});

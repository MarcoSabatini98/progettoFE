import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ContenutiComponent } from './contenuti-component';

describe('ContenutiComponent', () => {
  const contenuti = {
    elencaMedia: vi.fn(),
    elencaDocumentiLegali: vi.fn(),
    elencaEventi: vi.fn(),
  };

  beforeEach(() => {
    contenuti.elencaMedia.mockReset().mockReturnValue(of([]));
    contenuti.elencaDocumentiLegali.mockReturnValue(of([]));
    contenuti.elencaEventi.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { disponibili: signal(['it']) } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ContenutiComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const linguetta = async (indice: number) => {
      elemento.querySelectorAll<HTMLButtonElement>('.linguette button')[indice].click();
      await fixture.whenStable();
    };
    return { elemento, linguetta };
  }

  it('apre sulle foto: la galleria della struttura (la home sta nelle impostazioni)', async () => {
    const { elemento } = await crea();

    expect(elemento.querySelectorAll('app-galleria-media')).toHaveLength(1);
    expect(contenuti.elencaMedia).not.toHaveBeenCalledWith({ entita: 'home' });
    expect(contenuti.elencaMedia).toHaveBeenCalledWith({ entita: 'struttura' });
  });

  it('le linguette cambiano sezione', async () => {
    const { elemento, linguetta } = await crea();

    await linguetta(1);
    expect(elemento.querySelector('app-documenti-legali')).not.toBeNull();
    expect(elemento.querySelector('app-galleria-media')).toBeNull();

    await linguetta(2);
    expect(elemento.querySelector('app-eventi')).not.toBeNull();
    expect(elemento.querySelectorAll('.linguette button')[2].getAttribute('aria-pressed')).toBe(
      'true',
    );
  });
});

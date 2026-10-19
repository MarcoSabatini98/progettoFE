import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TassaSoggiornoAnnoComponent } from './tassa-soggiorno-anno-component';

describe('TassaSoggiornoAnnoComponent', () => {
  const analytics = { elencaTassaSoggiorno: vi.fn() };

  beforeEach(() => {
    analytics.elencaTassaSoggiorno.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: AnalyticsService, useValue: analytics },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(TassaSoggiornoAnnoComponent);
    fixture.componentRef.setInput('anno', 2030);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const testi = (elemento: Element, selettore: string) =>
    [...elemento.querySelectorAll(selettore)].map((cella) =>
      cella.textContent!.replace(/\s+/g, ' ').trim(),
    );

  it('mese per mese, coi totali per la dichiarazione', async () => {
    analytics.elencaTassaSoggiorno.mockReturnValue(
      of([
        { mese: '2030-07', prenotazioni: 2, ospiti: 5, notti: 12, tassa: 24 },
        { mese: '2030-08', prenotazioni: 1, ospiti: 2, notti: 3, tassa: 6.5 },
      ]),
    );
    const elemento = await crea();

    expect(analytics.elencaTassaSoggiorno).toHaveBeenCalledWith(2030);
    const righe = elemento.querySelectorAll('tbody tr');
    expect(righe[0].querySelector('th')?.textContent).toContain('luglio');
    expect(testi(righe[0], 'td')).toEqual(['2', '5', '12', '24,00 €']);
    expect(testi(elemento, 'tfoot td')).toEqual(['3', '7', '15', '30,50 €']);
  });

  it('senza soggiorni lo dice', async () => {
    analytics.elencaTassaSoggiorno.mockReturnValue(of([]));
    const elemento = await crea();

    expect(elemento.querySelector('table')).toBeNull();
    expect(elemento.querySelector('.stato-vuoto')).not.toBeNull();
  });

  it("mostra l'errore se il riepilogo non arriva", async () => {
    analytics.elencaTassaSoggiorno.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

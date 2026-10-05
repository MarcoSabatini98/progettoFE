import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { IncassoMensileInterface } from '../../../shared/models/incasso-mensile/incasso-mensile-model';
import { IncassiAnnoComponent } from './incassi-anno-component';

describe('IncassiAnnoComponent', () => {
  const analytics = { elencaIncassi: vi.fn() };
  const incassi: IncassoMensileInterface[] = [
    { mese: '2030-02', metodo: 'contanti', movimenti: 1, netto: -50 },
    { mese: '2030-01', metodo: 'contanti', movimenti: 2, netto: 200 },
    { mese: '2030-01', metodo: 'stripe', movimenti: 3, netto: 300 },
  ];

  beforeEach(() => {
    analytics.elencaIncassi.mockReset();
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
    const fixture = TestBed.createComponent(IncassiAnnoComponent);
    fixture.componentRef.setInput('anno', 2030);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  // Il formato della valuta usa spazi indivisibili: qui valgono come spazi normali.
  const testi = (elemento: HTMLElement, selettore: string) =>
    [...elemento.querySelectorAll(selettore)].map((cella) =>
      cella.textContent!.replace(/\s+/g, ' ').trim(),
    );

  it("un mese per riga, i metodi usati per colonna nell'ordine di sempre, coi totali", async () => {
    analytics.elencaIncassi.mockReturnValue(of(incassi));
    const elemento = await crea();

    expect(analytics.elencaIncassi).toHaveBeenCalledWith(2030);
    expect(testi(elemento, 'thead th')).toEqual([
      'gestionale.report.mese',
      'gestionale.metodi.stripe',
      'gestionale.metodi.contanti',
      'gestionale.report.totale',
    ]);
    const righe = elemento.querySelectorAll('tbody tr');
    expect(righe[0].querySelector('th')?.textContent).toContain('gennaio');
    expect(testi(righe[0] as HTMLElement, 'td')).toEqual(['300,00 €', '200,00 €', '500,00 €']);
    expect(testi(righe[1] as HTMLElement, 'td')).toEqual(['0,00 €', '-50,00 €', '-50,00 €']);
    expect(testi(elemento, 'tfoot td')).toEqual(['300,00 €', '150,00 €', '450,00 €']);
  });

  it('senza incassi lo dice', async () => {
    analytics.elencaIncassi.mockReturnValue(of([]));
    const elemento = await crea();

    expect(elemento.querySelector('table')).toBeNull();
    expect(elemento.querySelector('.stato-vuoto')).not.toBeNull();
  });

  it("mostra l'errore se i conti non arrivano", async () => {
    analytics.elencaIncassi.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

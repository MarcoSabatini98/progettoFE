import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { SuggerimentoPrezzoInterface } from '../../../shared/models/suggerimento-prezzo/suggerimento-prezzo-model';
import { SuggerimentiPrezzoComponent } from './suggerimenti-prezzo-component';

describe('SuggerimentiPrezzoComponent', () => {
  const analytics = { elencaSuggerimentiPrezzo: vi.fn() };
  const camere = { elencaTipologie: vi.fn() };

  function giorno(dati: Partial<SuggerimentoPrezzoInterface>): SuggerimentoPrezzoInterface {
    return {
      giorno: '2030-06-01',
      occupazione_percentuale: 50,
      percentuale: 0,
      motivi: [],
      prezzo_suggerito: null,
      ...dati,
    };
  }
  const giorni = [
    giorno({}),
    giorno({
      giorno: '2030-06-02',
      occupazione_percentuale: 20,
      percentuale: -15,
      motivi: [
        { codice: 'occupazione_bassa', valore: 30, percentuale: -10, motivo: '' },
        { codice: 'ultimo_minuto', valore: 7, percentuale: -5, motivo: '' },
      ],
    }),
  ];

  beforeEach(() => {
    analytics.elencaSuggerimentiPrezzo.mockReset();
    analytics.elencaSuggerimentiPrezzo.mockReturnValue(of(giorni));
    camere.elencaTipologie.mockReturnValue(of([{ id: 3, nome: 'Doppia' }]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: AnalyticsService, useValue: analytics },
        { provide: CamereService, useValue: camere },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SuggerimentiPrezzoComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scegli = async (indice: number) => {
      const tipologia = elemento.querySelector('select')!;
      tipologia.selectedIndex = indice;
      tipologia.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    return { elemento, scegli };
  }

  it('mostra solo i giorni da ritoccare, con percentuale e motivi', async () => {
    const { elemento } = await crea();

    expect(analytics.elencaSuggerimentiPrezzo).toHaveBeenCalledWith({});
    expect(camere.elencaTipologie).toHaveBeenCalledWith({ attiva: true });
    const schede = elemento.querySelectorAll('li.scheda');
    expect(schede).toHaveLength(1);
    expect(schede[0].querySelector('.percentuale')?.textContent).toContain('-15');
    expect(schede[0].querySelector('.percentuale')?.getAttribute('data-segno')).toBe('giu');
    expect(schede[0].querySelectorAll('.motivi li')).toHaveLength(2);
    expect(schede[0].textContent).toContain('gestionale.report.suggerimenti.motivi.ultimo_minuto');
    expect(schede[0].textContent).not.toContain('gestionale.report.suggerimenti.prezzo');
  });

  it('con una tipologia mostra il prezzo suggerito', async () => {
    const { elemento, scegli } = await crea();
    analytics.elencaSuggerimentiPrezzo.mockReturnValue(
      of([giorno({ ...giorni[1], prezzo_suggerito: 85 })]),
    );

    await scegli(1);

    expect(analytics.elencaSuggerimentiPrezzo).toHaveBeenLastCalledWith({ tipologia_id: 3 });
    expect(elemento.querySelector('li.scheda')?.textContent).toContain('85,00');
  });

  it('se non c’è niente da ritoccare lo dice', async () => {
    analytics.elencaSuggerimentiPrezzo.mockReturnValue(of([giorno({})]));
    const { elemento } = await crea();

    expect(elemento.querySelector('.stato-vuoto')).not.toBeNull();
  });

  it("mostra l'errore se i suggerimenti non arrivano", async () => {
    analytics.elencaSuggerimentiPrezzo.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

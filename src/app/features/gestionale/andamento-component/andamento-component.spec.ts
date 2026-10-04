import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { intervallo } from '../../../core/services/analytics/andamento';
import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ReportOccupazioneInterface } from '../../../shared/models/report-occupazione/report-occupazione-model';
import { ReportRicaviInterface } from '../../../shared/models/report-ricavi/report-ricavi-model';
import { AndamentoComponent } from './andamento-component';

describe('AndamentoComponent', () => {
  const analytics = {
    leggiOccupazione: vi.fn(),
    leggiRicavi: vi.fn(),
    elencaCanali: vi.fn(),
    scaricaReport: vi.fn(),
  };

  function occupazione(percentuale: number, ricavo: number): ReportOccupazioneInterface {
    return {
      dal: '2026-10-01',
      al: '2026-10-03',
      riepilogo: {
        notti_disponibili: 4,
        notti_vendute: 2,
        occupazione_percentuale: percentuale,
        ricavo_camere: ricavo,
        adr: 100,
        revpar: 50,
      },
      giorni: [
        {
          giorno: '2026-10-01',
          camere_disponibili: 2,
          camere_occupate: 2,
          occupazione_percentuale: 100,
          ricavo_camere: 200,
          prezzo_medio: 100,
        },
        {
          giorno: '2026-10-02',
          camere_disponibili: 2,
          camere_occupate: 0,
          occupazione_percentuale: 0,
          ricavo_camere: 0,
          prezzo_medio: 0,
        },
      ],
    };
  }

  const ricavi: ReportRicaviInterface = {
    dal: '2026-10-01',
    al: '2026-10-03',
    totale: 200,
    per_camera: [{ camera_id: 1, numero: '101', prenotazioni: 1, notti: 2, valore: 200 }],
    per_tipologia: [],
  };

  const canale = {
    canale: 'diretto',
    prenotazioni: 3,
    cancellate: 1,
    no_show: 0,
    notti: 6,
    valore: 600,
    durata_media: 2,
    anticipo_medio_giorni: 12.5,
  };

  beforeEach(() => {
    Object.values(analytics).forEach((spia) => spia.mockReset());
    analytics.leggiOccupazione
      .mockReturnValueOnce(of(occupazione(50, 200)))
      .mockReturnValueOnce(of(occupazione(40, 0)));
    analytics.leggiRicavi.mockReturnValue(of(ricavi));
    analytics.elencaCanali.mockReturnValue(of([canale]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: AnalyticsService, useValue: analytics },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  async function crea() {
    const fixture = TestBed.createComponent(AndamentoComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLElement>(selettore)!.click();
      await fixture.whenStable();
    };
    return { elemento, clicca };
  }

  it('confronta i numeri del mese con il mese prima', async () => {
    const { elemento } = await crea();

    expect(analytics.leggiOccupazione).toHaveBeenCalledWith(intervallo('mese'));
    const tessere = elemento.querySelectorAll('.tessera');
    expect(tessere).toHaveLength(5);
    expect(tessere[0].querySelector('.variazione')!.getAttribute('data-segno')).toBe('su');
    expect(tessere[1].textContent).toContain('gestionale.cruscotto.andamento.senzaConfronto');
    expect(elemento.querySelectorAll('app-grafico-barre')).toHaveLength(3);
  });

  it('mostra ricavi per camera, tipologie vuote e i canali', async () => {
    const { elemento } = await crea();

    const classifiche = elemento.querySelectorAll('.classifica');
    expect(classifiche[0].querySelector('.stato-vuoto')).not.toBeNull();
    expect(classifiche[1].textContent).toContain('200,00');
    expect(classifiche[1].querySelector<HTMLElement>('.quota span')!.style.inlineSize).toBe('100%');
    expect(elemento.querySelector('.canale')!.textContent).toContain('12,5');
  });

  it('cambiando periodo rilegge i dati di quel periodo', async () => {
    const { clicca } = await crea();
    analytics.leggiOccupazione.mockReturnValue(of(occupazione(10, 50)));

    await clicca('.periodi button');

    expect(analytics.leggiOccupazione).toHaveBeenCalledWith(intervallo('settimana'));
    expect(analytics.leggiRicavi).toHaveBeenLastCalledWith(intervallo('settimana'));
  });

  it('scarica il report del periodo e ne mostra il motivo se non riesce', async () => {
    analytics.scaricaReport.mockReturnValue(of(new Blob(['pdf'])));
    vi.stubGlobal(
      'URL',
      Object.assign(class extends URL {}, {
        createObjectURL: () => 'blob:file',
        revokeObjectURL: vi.fn(),
      }),
    );
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { elemento, clicca } = await crea();

    await clicca('.intestazione button');
    expect((clic.mock.contexts.at(-1) as HTMLAnchorElement).download).toBe(
      `report-${intervallo('mese').dal}.pdf`,
    );

    analytics.scaricaReport.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    await clicca('.intestazione button');
    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

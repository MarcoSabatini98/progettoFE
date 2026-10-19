import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ReportComponent } from './report-component';

describe('ReportComponent', () => {
  // Le sezioni hanno i loro spec: qui contano l'anno e chi lo riceve.
  const analytics = {
    elencaIncassi: vi.fn(() => of([])),
    elencaTassaSoggiorno: vi.fn(() => of([])),
    elencaSuggerimentiPrezzo: vi.fn(() => of([])),
  };

  beforeEach(() => {
    Object.values(analytics).forEach((spia) => spia.mockClear());
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: AnalyticsService, useValue: analytics },
        { provide: CamereService, useValue: { elencaTipologie: () => of([]) } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  it("parte dall'anno in corso e lo cambia solo quando è intero", async () => {
    const corrente = new Date().getFullYear();
    const fixture = TestBed.createComponent(ReportComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const anno = elemento.querySelector<HTMLInputElement>('input[type=number]')!;

    expect(elemento.querySelector('app-suggerimenti-prezzo')).not.toBeNull();
    expect(anno.value).toBe(String(corrente));
    expect(analytics.elencaIncassi).toHaveBeenCalledWith(corrente);
    expect(analytics.elencaTassaSoggiorno).toHaveBeenCalledWith(corrente);

    anno.value = '202';
    anno.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(analytics.elencaIncassi).toHaveBeenCalledTimes(1);

    anno.value = '2025';
    anno.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(analytics.elencaIncassi).toHaveBeenLastCalledWith(2025);
    expect(analytics.elencaTassaSoggiorno).toHaveBeenLastCalledWith(2025);
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { AuthService } from '../../../core/services/auth/auth-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { CruscottoComponent } from './cruscotto-component';

describe('CruscottoComponent', () => {
  // L'andamento sotto riceve un periodo vuoto: ha il suo spec.
  const periodo = { dal: '2026-10-01', al: '2026-11-01' };
  const riepilogo = {
    notti_disponibili: 0,
    notti_vendute: 0,
    occupazione_percentuale: 0,
    ricavo_camere: 0,
    adr: 0,
    revpar: 0,
  };
  const analytics = {
    leggiCruscotto: vi.fn(),
    leggiOccupazione: () => of({ ...periodo, riepilogo, giorni: [] }),
    leggiRicavi: () => of({ ...periodo, totale: 0, per_camera: [], per_tipologia: [] }),
    elencaCanali: () => of([]),
  };
  const auth = { puoAccedere: vi.fn() };
  const numeri = {
    arrivi_oggi: 3,
    partenze_oggi: 2,
    in_casa: 6,
    camere: 8,
    occupazione_oggi: 75,
    da_confermare: 4,
    manutenzioni_aperte: 1,
    recensioni_da_moderare: 0,
    incassato_mese: 1250,
    prenotato_da_inizio_mese: 3400,
  };

  beforeEach(() => {
    [analytics.leggiCruscotto, auth.puoAccedere].forEach((spia) => spia.mockReset());
    analytics.leggiCruscotto.mockReturnValue(of(numeri));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: AnalyticsService, useValue: analytics },
        { provide: AuthService, useValue: auth },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(permesso = true) {
    auth.puoAccedere.mockReturnValue(permesso);
    const fixture = TestBed.createComponent(CruscottoComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('mostra i numeri di oggi, quelli da fare e gli importi del mese', async () => {
    const { elemento } = await crea();

    const sezioni = elemento.querySelectorAll(':scope > section');
    expect(sezioni).toHaveLength(3);
    expect(sezioni[0].querySelectorAll('.tessera')).toHaveLength(4);
    expect(sezioni[0].querySelector('.valore')!.textContent).toContain(
      'gestionale.cruscotto.percentuale',
    );
    expect(sezioni[2].textContent).toContain('1250,00');
  });

  it('le tessere portano alle pagine permesse, con il filtro', async () => {
    const { elemento } = await crea();

    const link = elemento.querySelectorAll<HTMLAnchorElement>('a.tessera');
    expect(link).toHaveLength(6);
    expect(link[3].getAttribute('href')).toBe('/staff/prenotazioni?stato=in_attesa');
  });

  it('senza permessi le tessere restano numeri', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelectorAll('a.tessera')).toHaveLength(0);
    expect(elemento.querySelectorAll(':scope > section .tessera')).toHaveLength(9);
  });

  it('aggiorna i numeri e mostra il motivo del rifiuto', async () => {
    const { fixture, elemento } = await crea();
    analytics.leggiCruscotto.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );

    elemento.querySelector<HTMLButtonElement>('.strumenti button')!.click();
    await fixture.whenStable();

    expect(analytics.leggiCruscotto).toHaveBeenCalledTimes(2);
    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

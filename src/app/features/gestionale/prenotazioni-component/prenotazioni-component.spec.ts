import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PrenotazioniComponent } from './prenotazioni-component';

describe('PrenotazioniComponent', () => {
  const prenotazioni = { elencaPrenotazioni: vi.fn() };
  const prenotazione = {
    id: 7,
    codice: 'BB-7',
    stato: 'confermata',
    data_arrivo: '2030-06-01',
    data_partenza: '2030-06-03',
    adulti: 2,
    bambini: 0,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    prenotazioni.elencaPrenotazioni.mockReset();
    prenotazioni.elencaPrenotazioni.mockReturnValue(
      of({ elementi: [prenotazione], totale: 41, pagina: 1, perPagina: 10, pagine: 3 }),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: AuthService, useValue: { haPermessi: () => true } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  // Coi timer finti lo scheduler di Angular aspetta il debounce: si fa scorrere il tempo.
  async function attendi(fixture: ComponentFixture<PrenotazioniComponent>) {
    await vi.runAllTimersAsync();
    await fixture.whenStable();
  }

  async function crea() {
    const fixture = TestBed.createComponent(PrenotazioniComponent);
    await attendi(fixture);
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('carica la prima pagina, dalle prenotazioni più recenti', async () => {
    const { elemento } = await crea();

    expect(prenotazioni.elencaPrenotazioni).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 1, perPagina: 10, ordine: 'desc', stato: [] }),
    );
    expect(elemento.querySelectorAll('app-riga-prenotazione')).toHaveLength(1);
  });

  it('i filtri arrivano all’API e riportano alla prima pagina', async () => {
    const { fixture, elemento } = await crea();
    elemento.querySelector<HTMLButtonElement>('.pagine > button:last-of-type')!.click();
    await attendi(fixture);
    expect(prenotazioni.elencaPrenotazioni).toHaveBeenLastCalledWith(
      expect.objectContaining({ pagina: 2 }),
    );

    const stato = elemento.querySelector<HTMLSelectElement>('select')!;
    stato.value = 'confermata';
    stato.dispatchEvent(new Event('change'));
    await attendi(fixture);

    expect(prenotazioni.elencaPrenotazioni).toHaveBeenLastCalledWith(
      expect.objectContaining({ pagina: 1, stato: ['confermata'] }),
    );
  });

  it('sulla prima pagina non si torna indietro', async () => {
    const { elemento } = await crea();

    const precedente = elemento.querySelector<HTMLButtonElement>('.pagine > button:first-of-type')!;
    const successiva = elemento.querySelector<HTMLButtonElement>('.pagine > button:last-of-type')!;
    expect(precedente.disabled).toBe(true);
    expect(successiva.disabled).toBe(false);
  });

  it('parte dallo stato arrivato col link', async () => {
    await TestBed.inject(Router).navigateByUrl('/?stato=in_attesa');
    await crea();

    expect(prenotazioni.elencaPrenotazioni).toHaveBeenCalledWith(
      expect.objectContaining({ stato: ['in_attesa'] }),
    );
  });
});

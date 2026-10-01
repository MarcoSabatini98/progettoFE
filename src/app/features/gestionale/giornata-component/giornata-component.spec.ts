import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { dataCalendario } from '../../../core/services/disponibilita/date-soggiorno';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { GiornataComponent } from './giornata-component';

describe('GiornataComponent', () => {
  const prenotazioni = { leggiGiornata: vi.fn(), confermaPrenotazione: vi.fn() };
  const auth = { haPermessi: vi.fn() };
  const arrivo = {
    id: 7,
    codice: 'BB-7',
    stato: 'in_attesa',
    data_arrivo: '2030-06-01',
    data_partenza: '2030-06-03',
    adulti: 2,
    bambini: 0,
  };

  beforeEach(() => {
    [prenotazioni.leggiGiornata, prenotazioni.confermaPrenotazione, auth.haPermessi].forEach(
      (spia) => spia.mockReset(),
    );
    prenotazioni.leggiGiornata.mockReturnValue(
      of({ giorno: '2030-06-01', arrivi: [arrivo], partenze: [], in_casa: [] }),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: AuthService, useValue: auth },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(permesso = true) {
    auth.haPermessi.mockReturnValue(permesso);
    const fixture = TestBed.createComponent(GiornataComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('carica oggi e divide arrivi, partenze e ospiti in casa', async () => {
    const { elemento } = await crea();

    const sezioni = elemento.querySelectorAll('section');
    expect(prenotazioni.leggiGiornata).toHaveBeenCalledWith(dataCalendario(new Date()));
    expect(sezioni).toHaveLength(3);
    expect(sezioni[0].querySelectorAll('app-riga-prenotazione')).toHaveLength(1);
    expect(sezioni[1].textContent).toContain('gestionale.oggi.vuoto');
  });

  it('cambiando giorno ricarica la giornata', async () => {
    const { fixture, elemento } = await crea();
    const campo = elemento.querySelector<HTMLInputElement>('input[type=date]')!;

    campo.value = '2030-06-05';
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(prenotazioni.leggiGiornata).toHaveBeenLastCalledWith('2030-06-05');
  });

  it('una prenotazione aggiornata ricarica la giornata', async () => {
    prenotazioni.confermaPrenotazione.mockReturnValue(of(arrivo));
    const { fixture, elemento } = await crea();

    elemento.querySelector<HTMLElement>('app-azioni-prenotazione button')?.click();
    await fixture.whenStable();

    expect(prenotazioni.confermaPrenotazione).toHaveBeenCalledWith(7);
    expect(prenotazioni.leggiGiornata).toHaveBeenCalledTimes(2);
  });

  it('senza il permesso di gestire non propone una nuova prenotazione', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelector('a.pulsante-primario')).toBeNull();
  });
});

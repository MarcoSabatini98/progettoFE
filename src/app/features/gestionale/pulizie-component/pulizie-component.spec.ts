import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { dataCalendario } from '../../../core/services/disponibilita/date-soggiorno';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { PulizieComponent } from './pulizie-component';

describe('PulizieComponent', () => {
  const pulizie = {
    elencaAttivita: vi.fn(),
    generaGiornata: vi.fn(),
    assegnaGiornata: vi.fn(),
    elencaAddetti: vi.fn(),
  };
  const auth = { haPermessi: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const attivita = (id: number, stato: string) => ({
    id,
    stato,
    tipo: 'riassetto',
    priorita: 'normale',
    checklist: [],
    camera: { numero: `10${id}` },
  });

  beforeEach(() => {
    [...Object.values(pulizie), auth.haPermessi, avvisi.mostra].forEach((spia) => spia.mockReset());
    pulizie.elencaAttivita.mockReturnValue(
      of([attivita(1, 'da_fare'), attivita(2, 'da_fare'), attivita(3, 'completata')]),
    );
    pulizie.elencaAddetti.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PulizieService, useValue: pulizie },
        { provide: CamereService, useValue: { elencaCamere: () => of([]) } },
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea(gestore = true) {
    auth.haPermessi.mockReturnValue(gestore);
    const fixture = TestBed.createComponent(PulizieComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  function pulsante(elemento: HTMLElement, chiave: string): HTMLButtonElement {
    return Array.from(elemento.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(chiave),
    )!;
  }

  it('divide le attività di oggi per stato', async () => {
    const { elemento } = await crea();

    const sezioni = elemento.querySelectorAll('section');
    expect(pulizie.elencaAttivita).toHaveBeenCalledWith({
      data: dataCalendario(new Date()),
      mie: undefined,
    });
    expect(sezioni).toHaveLength(4);
    expect(sezioni[0].querySelectorAll('app-riga-pulizia')).toHaveLength(2);
    expect(sezioni[1].textContent).toContain('gestionale.pulizie.vuoto');
  });

  it('filtra le mie e cambia giorno', async () => {
    const { fixture, elemento } = await crea();

    elemento.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    const giorno = elemento.querySelector<HTMLInputElement>('input[type=date]')!;
    giorno.value = '2030-06-05';
    giorno.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(pulizie.elencaAttivita).toHaveBeenLastCalledWith({ data: '2030-06-05', mie: true });
  });

  it('genera la giornata, avvisa e ricarica', async () => {
    pulizie.generaGiornata.mockReturnValue(of({ riassetti: 2, checklist_aggiunte: 0 }));
    const { fixture, elemento } = await crea();

    pulsante(elemento, 'gestionale.pulizie.genera').click();
    await fixture.whenStable();

    expect(pulizie.generaGiornata).toHaveBeenCalledWith(dataCalendario(new Date()));
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'successo');
    expect(pulizie.elencaAttivita).toHaveBeenCalledTimes(2);
  });

  it('se l assegnazione fallisce lo dice', async () => {
    pulizie.assegnaGiornata.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const { elemento } = await crea();

    pulsante(elemento, 'gestionale.pulizie.assegna').click();

    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'errore');
  });

  it('senza permessi solo la giornata in lettura', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelector('input[type=checkbox]')).toBeNull();
    expect(elemento.querySelector('app-nuova-pulizia')).toBeNull();
    expect(elemento.querySelectorAll('button')).toHaveLength(0);
  });
});

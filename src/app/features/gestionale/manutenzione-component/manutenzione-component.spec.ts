import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import { ManutenzioneComponent } from './manutenzione-component';

describe('ManutenzioneComponent', () => {
  const manutenzione = { elencaSegnalazioni: vi.fn(), segnala: vi.fn() };
  const auth = { haPermessi: vi.fn() };
  const pagina = {
    elementi: [
      { id: 1, titolo: 'Rubinetto', priorita: 'alta', stato: 'aperta', creato_il: '2030-06-01' },
    ],
    totale: 1,
    pagina: 1,
    perPagina: 20,
    pagine: 1,
  };

  beforeEach(() => {
    Object.values(manutenzione).forEach((spia) => spia.mockReset());
    manutenzione.elencaSegnalazioni.mockReturnValue(of(pagina));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: ManutenzioneService, useValue: manutenzione },
        { provide: AuthService, useValue: auth },
        { provide: CamereService, useValue: { elencaCamere: () => of([]) } },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea(gestore = true) {
    auth.haPermessi.mockReturnValue(gestore);
    const fixture = TestBed.createComponent(ManutenzioneComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  async function scegli(
    fixture: { whenStable(): Promise<unknown> },
    campo: HTMLSelectElement,
    valore: string,
  ) {
    campo.value = valore;
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  it('parte dalle segnalazioni da risolvere', async () => {
    const { elemento } = await crea();

    expect(manutenzione.elencaSegnalazioni).toHaveBeenCalledWith({
      aperte: true,
      priorita: undefined,
      mie: undefined,
      pagina: 1,
      perPagina: 20,
    });
    expect(elemento.querySelectorAll('app-riga-segnalazione')).toHaveLength(1);
    expect(elemento.querySelector('app-nuova-segnalazione')).not.toBeNull();
  });

  it('filtra per stato, priorità e solo le mie', async () => {
    const { fixture, elemento } = await crea();
    const [stato, priorita] = Array.from(
      elemento.querySelectorAll<HTMLSelectElement>('form[role=search] select'),
    );

    await scegli(fixture, stato, 'risolta');
    await scegli(fixture, priorita, 'urgente');
    elemento.querySelector<HTMLInputElement>('form[role=search] input[type=checkbox]')!.click();
    await fixture.whenStable();

    expect(manutenzione.elencaSegnalazioni).toHaveBeenLastCalledWith({
      stato: 'risolta',
      priorita: 'urgente',
      mie: true,
      pagina: 1,
      perPagina: 20,
    });

    await scegli(fixture, stato, 'tutte');
    expect(manutenzione.elencaSegnalazioni).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ stato: expect.anything() }),
    );
  });

  it('chi segnala soltanto non ha il filtro delle sue', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelector('form[role=search] input[type=checkbox]')).toBeNull();
  });

  it('mostra l errore se l elenco non arriva', async () => {
    manutenzione.elencaSegnalazioni.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { dataCalendario } from '../../../core/services/disponibilita/date-soggiorno';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { PulizieComponent } from './pulizie-component';

describe('PulizieComponent', () => {
  const pulizie = {
    elencaAttivita: vi.fn(),
    generaGiornata: vi.fn(),
    assegnaGiornata: vi.fn(),
    elencaAddetti: vi.fn(),
    avanzaAttivita: vi.fn(),
    aggiornaAttivita: vi.fn(),
    prossima: vi.fn(),
  };
  const auth = { haPermessi: vi.fn(), utente: () => ({ id: 1 }) };
  const pubbliche = signal<Record<string, unknown>>({});
  const avvisi = { mostra: vi.fn() };
  const attivita = (id: number, stato: string, assegnata_a?: number) => ({
    id,
    stato,
    assegnata_a,
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
    pulizie.elencaAddetti.mockReturnValue(of([{ id: 7, nome: 'Anna', cognome: 'Rossi' }]));
    pubbliche.set({});
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PulizieService, useValue: pulizie },
        { provide: CamereService, useValue: { elencaCamere: () => of([]) } },
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: avvisi },
        { provide: ImpostazioniService, useValue: { pubbliche } },
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

  function scegli(elemento: HTMLElement, sezione: number, verso: string): void {
    const menu = elemento.querySelectorAll('section')[sezione].querySelector('select')!;
    menu.value = verso;
    menu.dispatchEvent(new Event('change'));
  }

  it('trascinata in un altro stato la fa avanzare e la sposta di colonna', async () => {
    pulizie.avanzaAttivita.mockReturnValue(of(attivita(1, 'in_corso', 1)));
    const { fixture, elemento } = await crea();

    scegli(elemento, 0, 'in_corso');
    await fixture.whenStable();

    const sezioni = elemento.querySelectorAll('section');
    expect(pulizie.avanzaAttivita).toHaveBeenCalledWith(1, { stato: 'in_corso' });
    expect(sezioni[0].querySelectorAll('app-riga-pulizia')).toHaveLength(1);
    expect(sezioni[1].querySelectorAll('app-riga-pulizia')).toHaveLength(1);
  });

  it('finita una camera ricarica la giornata: a turno ne arriva un altra', async () => {
    pulizie.avanzaAttivita.mockReturnValue(of(attivita(1, 'completata', 1)));
    const { fixture, elemento } = await crea();

    scegli(elemento, 0, 'in_corso');
    await fixture.whenStable();

    expect(pulizie.elencaAttivita).toHaveBeenCalledTimes(2);
  });

  it('chi non ha camere aperte oggi si prende la prossima', async () => {
    pulizie.prossima.mockReturnValue(of(attivita(2, 'da_fare', 1)));
    const { fixture, elemento } = await crea();

    pulsante(elemento, 'gestionale.pulizie.prossima').click();
    await fixture.whenStable();

    expect(pulizie.prossima).toHaveBeenCalled();
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'successo');
    expect(pulizie.elencaAttivita).toHaveBeenCalledTimes(2);
  });

  it('con una camera aperta o in un altro giorno niente prossima', async () => {
    pulizie.elencaAttivita.mockReturnValue(of([attivita(1, 'in_corso', 1)]));
    const { fixture, elemento } = await crea();
    expect(pulsante(elemento, 'gestionale.pulizie.prossima')).toBeUndefined();

    pulizie.elencaAttivita.mockReturnValue(of([]));
    const giorno = elemento.querySelector<HTMLInputElement>('input[type=date]')!;
    giorno.value = '2030-06-05';
    giorno.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(pulsante(elemento, 'gestionale.pulizie.prossima')).toBeUndefined();
  });

  it('se lo spostamento è rifiutato lo dice', async () => {
    pulizie.avanzaAttivita.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: {} })),
    );
    const { elemento } = await crea();

    scegli(elemento, 0, 'in_corso');

    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'errore');
  });

  it('senza ispezione niente colonna Verificate', async () => {
    pubbliche.set({ pulizie_richiedi_ispezione: false });
    const { elemento } = await crea();

    const sezioni = elemento.querySelectorAll('section');
    expect(sezioni).toHaveLength(3);
    expect(sezioni[2].textContent).toContain('gestionale.pulizie.completate');
  });

  it('per addetto assegna le libere e libera le assegnate', async () => {
    pulizie.elencaAttivita.mockReturnValue(of([attivita(1, 'da_fare'), attivita(2, 'da_fare', 7)]));
    pulizie.aggiornaAttivita.mockReturnValue(of(attivita(1, 'da_fare', 7)));
    const { fixture, elemento } = await crea();

    pulsante(elemento, 'gestionale.pulizie.viste.addetto').click();
    await fixture.whenStable();
    expect(elemento.querySelectorAll('section')).toHaveLength(2);

    scegli(elemento, 0, '7');
    scegli(elemento, 1, 'libere');

    expect(pulizie.aggiornaAttivita).toHaveBeenCalledWith(1, { assegnata_a: 7 });
    expect(pulizie.aggiornaAttivita).toHaveBeenCalledWith(2, { assegnata_a: null });
  });

  it('senza permessi solo la giornata in lettura', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelector('input[type=checkbox]')).toBeNull();
    expect(elemento.querySelector('app-nuova-pulizia')).toBeNull();
    expect(elemento.querySelectorAll('button')).toHaveLength(0);
    expect(elemento.querySelector('select')).toBeNull();
  });
});

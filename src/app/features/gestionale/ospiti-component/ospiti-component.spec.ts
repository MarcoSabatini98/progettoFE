import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { OspitiComponent } from './ospiti-component';

describe('OspitiComponent', () => {
  const ospiti = { elencaOspiti: vi.fn(), creaOspite: vi.fn() };
  const anna = { id: 3, nome: 'Anna', cognome: 'Verdi', email: 'anna@example.com', telefono: null };

  beforeEach(() => {
    vi.useFakeTimers();
    ospiti.elencaOspiti.mockReset();
    ospiti.creaOspite.mockReset();
    ospiti.elencaOspiti.mockReturnValue(
      of({ elementi: [anna], totale: 41, pagina: 1, perPagina: 10, pagine: 3 }),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: OspitiService, useValue: ospiti }],
    });
  });

  afterEach(() => vi.useRealTimers());

  // Coi timer finti lo scheduler di Angular aspetta il debounce: si fa scorrere il tempo.
  async function attendi(fixture: ComponentFixture<OspitiComponent>) {
    await vi.runAllTimersAsync();
    await fixture.whenStable();
  }

  async function crea() {
    const fixture = TestBed.createComponent(OspitiComponent);
    await attendi(fixture);
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = async (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event('input'));
      await attendi(fixture);
    };
    return { fixture, elemento, scrivi };
  }

  it('elenca gli ospiti con il link alla scheda', async () => {
    const { elemento } = await crea();

    expect(ospiti.elencaOspiti).toHaveBeenCalledWith({ cerca: '', pagina: 1, perPagina: 10 });
    const riga = elemento.querySelector('.elenco a')!;
    expect(riga.textContent).toContain('Verdi Anna');
    expect(riga.getAttribute('href')).toBe('/staff/ospiti/3');
  });

  it('cercando riparte dalla prima pagina', async () => {
    const { fixture, elemento, scrivi } = await crea();
    elemento.querySelector<HTMLButtonElement>('.pagine > button:last-of-type')!.click();
    await attendi(fixture);
    expect(ospiti.elencaOspiti).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 2 }));

    await scrivi('input[type=search]', 'ver');

    expect(ospiti.elencaOspiti).toHaveBeenLastCalledWith({
      cerca: 'ver',
      pagina: 1,
      perPagina: 10,
    });
  });

  it('crea la nuova anagrafica e apre la sua scheda', async () => {
    ospiti.creaOspite.mockReturnValue(of({ ...anna, id: 8 }));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { elemento, scrivi } = await crea();

    await scrivi('[formControlName=nome]', 'Luca');
    await scrivi('[formControlName=cognome]', 'Neri');
    elemento.querySelector('section form')!.dispatchEvent(new Event('submit'));

    expect(ospiti.creaOspite).toHaveBeenCalledWith({ nome: 'Luca', cognome: 'Neri' });
    expect(naviga).toHaveBeenCalledWith(['/staff/ospiti', 8]);
  });

  it('senza cognome non crea; se il backend rifiuta lo spiega', async () => {
    ospiti.creaOspite.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errore: { messaggio: 'Dati non validi' } },
          }),
      ),
    );
    const { fixture, elemento, scrivi } = await crea();
    const invia = async () => {
      elemento.querySelector('section form')!.dispatchEvent(new Event('submit'));
      await attendi(fixture);
    };

    await scrivi('[formControlName=nome]', 'Luca');
    await invia();
    expect(ospiti.creaOspite).not.toHaveBeenCalled();

    await scrivi('[formControlName=cognome]', 'Neri');
    await invia();
    expect(elemento.querySelector('section [role=alert]')?.textContent).toContain(
      'Dati non validi',
    );
  });
});

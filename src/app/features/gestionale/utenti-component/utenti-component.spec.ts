import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { UtentiComponent } from './utenti-component';

describe('UtentiComponent', () => {
  const utenti = { elencaUtenti: vi.fn(), creaUtente: vi.fn() };
  const pagina = {
    elementi: [
      {
        id: 3,
        nome: 'Anna',
        cognome: 'Rossi',
        email: 'anna@esempio.it',
        ruolo: 'receptionist',
        attivo: true,
      },
    ],
    totale: 1,
    pagina: 1,
    perPagina: 10,
    pagine: 1,
  };
  const tutti = { cerca: undefined, ruolo: undefined, attivo: undefined, pagina: 1, perPagina: 10 };

  beforeEach(() => {
    vi.useFakeTimers();
    utenti.elencaUtenti.mockReset();
    utenti.elencaUtenti.mockReturnValue(of(pagina));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: UtentiService, useValue: utenti }],
    });
  });

  afterEach(() => vi.useRealTimers());

  // Coi timer finti lo scheduler di Angular aspetta il debounce: si fa scorrere il tempo.
  async function attendi(fixture: ComponentFixture<UtentiComponent>) {
    await vi.runAllTimersAsync();
    await fixture.whenStable();
  }

  async function crea() {
    const fixture = TestBed.createComponent(UtentiComponent);
    await attendi(fixture);
    const elemento: HTMLElement = fixture.nativeElement;
    const imposta = async (selettore: string, valore: string, evento = 'input') => {
      const campo = elemento.querySelector<HTMLInputElement>(`form[role=search] ${selettore}`)!;
      campo.value = valore;
      campo.dispatchEvent(new Event(evento));
      await attendi(fixture);
    };
    return { elemento, imposta };
  }

  it('parte da tutti gli account, col modulo del nuovo staff', async () => {
    const { elemento } = await crea();

    expect(utenti.elencaUtenti).toHaveBeenCalledWith(tutti);
    expect(elemento.querySelectorAll('app-riga-utente')).toHaveLength(1);
    expect(elemento.querySelector('app-nuovo-staff')).not.toBeNull();
  });

  it('cerca per nome e filtra per ruolo e stato', async () => {
    const { imposta } = await crea();

    await imposta('[formControlName=cerca]', ' rossi ');
    await imposta('[formControlName=ruolo]', 'housekeeper', 'change');
    await imposta('[formControlName=attivo]', 'false', 'change');
    expect(utenti.elencaUtenti).toHaveBeenLastCalledWith({
      ...tutti,
      cerca: 'rossi',
      ruolo: 'housekeeper',
      attivo: false,
    });

    await imposta('[formControlName=attivo]', 'true', 'change');
    expect(utenti.elencaUtenti).toHaveBeenLastCalledWith({
      ...tutti,
      cerca: 'rossi',
      ruolo: 'housekeeper',
      attivo: true,
    });
  });

  it("mostra l'errore se l'elenco non arriva", async () => {
    utenti.elencaUtenti.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

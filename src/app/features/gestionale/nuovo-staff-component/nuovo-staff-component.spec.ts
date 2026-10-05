import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { NuovoStaffComponent } from './nuovo-staff-component';

describe('NuovoStaffComponent', () => {
  const utenti = { creaUtente: vi.fn() };

  beforeEach(() => {
    utenti.creaUtente.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: UtentiService, useValue: utenti }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(NuovoStaffComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = (selettore: string, valore: string, evento = 'input') => {
      const campo = elemento.querySelector<HTMLInputElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event(evento));
    };
    const compila = () => {
      scrivi('[formControlName=nome]', 'Anna');
      scrivi('[formControlName=cognome]', 'Rossi');
      scrivi('[formControlName=email]', 'anna@esempio.it');
      scrivi('[formControlName=ruolo]', 'housekeeper', 'change');
      elemento.querySelectorAll('app-nuova-password input').forEach((campo) => {
        (campo as HTMLInputElement).value = 'segreta-123';
        campo.dispatchEvent(new Event('input'));
      });
    };
    const invia = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, compila, invia };
  }

  it('senza i dati obbligatori non crea nulla', async () => {
    const { invia } = await crea();

    await invia();

    expect(utenti.creaUtente).not.toHaveBeenCalled();
  });

  it("crea l'account e apre la sua scheda", async () => {
    utenti.creaUtente.mockReturnValue(of({ id: 7 }));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { compila, invia } = await crea();

    compila();
    await invia();

    expect(utenti.creaUtente).toHaveBeenCalledWith({
      nome: 'Anna',
      cognome: 'Rossi',
      email: 'anna@esempio.it',
      telefono: null,
      lingua: 'it',
      ruolo: 'housekeeper',
      password: 'segreta-123',
    });
    expect(naviga).toHaveBeenCalledWith(['/staff/utenti', 7]);
  });

  it('se la email è già usata lo dice', async () => {
    utenti.creaUtente.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'EMAIL_GIA_REGISTRATA', messaggio: 'Email già usata' } },
          }),
      ),
    );
    const { elemento, compila, invia } = await crea();

    compila();
    await invia();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Email già usata');
  });
});

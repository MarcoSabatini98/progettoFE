import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { NavigazioneService } from '../../../core/services/navigazione/navigazione-service';
import { AccessoComponent } from './accesso-component';

describe('AccessoComponent', () => {
  const auth = { accedi: vi.fn() };

  beforeEach(() => {
    auth.accedi.mockReset();
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          moduli: { required: 'Campo obbligatorio' },
          errori: { CREDENZIALI_NON_VALIDE: 'Email o password errate' },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: NavigazioneService, useValue: { paginaIniziale: signal('/staff') } },
      ],
    });
  });

  async function crea(ritorno?: string) {
    const fixture = TestBed.createComponent(AccessoComponent);
    if (ritorno) {
      fixture.componentRef.setInput('ritorno', ritorno);
    }
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const compila = (email: string, password: string) => {
      const [campoEmail, campoPassword] = elemento.querySelectorAll('input');
      campoEmail.value = email;
      campoEmail.dispatchEvent(new Event('input'));
      campoPassword.value = password;
      campoPassword.dispatchEvent(new Event('input'));
    };
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, compila, invia };
  }

  it('con campi vuoti mostra gli errori e non chiama il backend', async () => {
    const { elemento, invia } = await crea();

    await invia();

    expect(auth.accedi).not.toHaveBeenCalled();
    expect(elemento.querySelectorAll('.campo-errore')).toHaveLength(2);
  });

  it('dopo l’accesso torna alla pagina richiesta', async () => {
    auth.accedi.mockReturnValue(of({}));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { compila, invia } = await crea('/staff/prenotazioni');

    compila('anna@esempio.it', 'segreta-123');
    await invia();

    expect(auth.accedi).toHaveBeenCalledWith({
      email: 'anna@esempio.it',
      password: 'segreta-123',
    });
    expect(naviga).toHaveBeenCalledWith('/staff/prenotazioni');
  });

  it('senza pagina richiesta va a quella iniziale del ruolo', async () => {
    auth.accedi.mockReturnValue(of({}));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { compila, invia } = await crea();

    compila('anna@esempio.it', 'segreta-123');
    await invia();

    expect(naviga).toHaveBeenCalledWith('/staff');
  });

  it('mostra l’errore del backend', async () => {
    auth.accedi.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { errore: { codice: 'CREDENZIALI_NON_VALIDE', messaggio: 'x' } },
          }),
      ),
    );
    const { elemento, compila, invia } = await crea();

    compila('anna@esempio.it', 'sbagliata');
    await invia();

    expect(elemento.querySelector('.esito-errore')?.textContent).toContain(
      'Email o password errate',
    );
  });
});

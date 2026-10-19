import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { SicurezzaComponent } from './sicurezza-component';

describe('SicurezzaComponent', () => {
  const auth = { cambiaPassword: vi.fn(), esciOvunque: vi.fn() };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          sicurezza: { cambiata: 'Password cambiata', uscito: 'Sessioni chiuse' },
          errori: { PASSWORD_ATTUALE_ERRATA: 'Password attuale errata' },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SicurezzaComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const cambia = async (attuale: string, nuova: string) => {
      const valori = [attuale, nuova, nuova];
      elemento.querySelectorAll('input').forEach((campo, i) => {
        campo.value = valori[i];
        campo.dispatchEvent(new Event('input'));
      });
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, elemento, naviga, cambia };
  }

  it('cambia la password e rimanda all’accesso', async () => {
    auth.cambiaPassword.mockReturnValue(of(null));
    const { naviga, cambia } = await crea();

    await cambia('vecchia-123', 'nuova-1234');

    expect(auth.cambiaPassword).toHaveBeenCalledWith({
      password_attuale: 'vecchia-123',
      nuova_password: 'nuova-1234',
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('Password cambiata', 'successo');
    expect(naviga).toHaveBeenCalledWith('/accesso');
  });

  it('mostra la password attuale sbagliata', async () => {
    auth.cambiaPassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errore: { codice: 'PASSWORD_ATTUALE_ERRATA', messaggio: '' } },
          }),
      ),
    );
    const { elemento, naviga, cambia } = await crea();

    await cambia('sbagliata', 'nuova-1234');

    expect(elemento.querySelector('.esito-errore')?.textContent).toContain(
      'Password attuale errata',
    );
    expect(naviga).not.toHaveBeenCalled();
  });

  it('chiude tutte le sessioni e torna alla home', async () => {
    auth.esciOvunque.mockReturnValue(of(null));
    const { fixture, elemento, naviga } = await crea();

    elemento.querySelector<HTMLButtonElement>('.sessioni button')?.click();
    await fixture.whenStable();

    expect(avvisi.mostra).toHaveBeenCalledWith('Sessioni chiuse', 'successo');
    expect(naviga).toHaveBeenCalledWith('/');
  });
});

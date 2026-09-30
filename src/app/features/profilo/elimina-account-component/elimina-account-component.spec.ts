import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { EliminaAccountComponent } from './elimina-account-component';

describe('EliminaAccountComponent', () => {
  const auth = { eliminaAccount: vi.fn() };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          eliminaAccount: { fatto: 'Account eliminato' },
          errori: { PRENOTAZIONI_ATTIVE: 'Hai prenotazioni attive' },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function confermaCon(password: string) {
    const fixture = TestBed.createComponent(EliminaAccountComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    elemento.querySelector('button')?.click();
    await fixture.whenStable();
    const campo = elemento.querySelector('input')!;
    campo.value = password;
    campo.dispatchEvent(new Event('input'));
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    return { elemento, naviga };
  }

  it('chiede la password prima di eliminare', async () => {
    const fixture = TestBed.createComponent(EliminaAccountComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('elimina l’account e torna alla home', async () => {
    auth.eliminaAccount.mockReturnValue(of(null));

    const { naviga } = await confermaCon('segreta-123');

    expect(auth.eliminaAccount).toHaveBeenCalledWith('segreta-123');
    expect(avvisi.mostra).toHaveBeenCalledWith('Account eliminato', 'successo');
    expect(naviga).toHaveBeenCalledWith('/');
  });

  it('spiega il rifiuto per prenotazioni attive', async () => {
    auth.eliminaAccount.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'PRENOTAZIONI_ATTIVE', messaggio: '' } },
          }),
      ),
    );

    const { elemento, naviga } = await confermaCon('segreta-123');

    expect(elemento.querySelector('.esito-errore')?.textContent).toContain(
      'Hai prenotazioni attive',
    );
    expect(naviga).not.toHaveBeenCalled();
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { RecuperoPasswordComponent } from './recupero-password-component';

describe('RecuperoPasswordComponent', () => {
  const auth = { richiediResetPassword: vi.fn() };

  beforeEach(() => {
    auth.richiediResetPassword.mockReset();
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          recupero: { inviata: 'Controlla la posta' },
          errori: { rete: 'Nessuna connessione' },
        }),
      ],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  async function inviaEmail(email: string) {
    const fixture = TestBed.createComponent(RecuperoPasswordComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const campo = elemento.querySelector('input') as HTMLInputElement;
    campo.value = email;
    campo.dispatchEvent(new Event('input'));
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    return elemento;
  }

  it('non invia un’email non valida', async () => {
    await inviaEmail('non-una-email');

    expect(auth.richiediResetPassword).not.toHaveBeenCalled();
  });

  it('dopo l’invio mostra la conferma al posto del modulo', async () => {
    auth.richiediResetPassword.mockReturnValue(of(null));

    const elemento = await inviaEmail('anna@esempio.it');

    expect(auth.richiediResetPassword).toHaveBeenCalledWith('anna@esempio.it');
    expect(elemento.querySelector('form')).toBeNull();
    expect(elemento.querySelector('.esito-inviata')?.textContent).toContain('Controlla la posta');
  });

  it('mostra l’errore se la richiesta fallisce', async () => {
    auth.richiediResetPassword.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );

    const elemento = await inviaEmail('anna@esempio.it');

    expect(elemento.querySelector('.esito-errore')?.textContent).toContain('Nessuna connessione');
  });
});

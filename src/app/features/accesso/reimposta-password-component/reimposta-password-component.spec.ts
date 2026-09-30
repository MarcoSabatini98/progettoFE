import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ReimpostaPasswordComponent } from './reimposta-password-component';

describe('ReimpostaPasswordComponent', () => {
  const auth = { impostaNuovaPassword: vi.fn() };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    auth.impostaNuovaPassword.mockReset();
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          reimposta: { fatto: 'Password aggiornata' },
          moduli: { passwordDiverse: 'Le password non coincidono' },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea(token?: string) {
    const fixture = TestBed.createComponent(ReimpostaPasswordComponent);
    if (token) {
      fixture.componentRef.setInput('token', token);
    }
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const invia = async (password: string, conferma: string) => {
      const [campoPassword, campoConferma] = elemento.querySelectorAll('input');
      campoPassword.value = password;
      campoPassword.dispatchEvent(new Event('input'));
      campoConferma.value = conferma;
      campoConferma.dispatchEvent(new Event('input'));
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, invia };
  }

  it('senza token propone di chiedere un nuovo link', async () => {
    const { elemento } = await crea();

    expect(elemento.querySelector('form')).toBeNull();
    expect(elemento.querySelector('.non-valido')).not.toBeNull();
  });

  it('non salva se le password non coincidono', async () => {
    const { elemento, invia } = await crea('abc');

    await invia('segreta-123', 'segreta-124');

    expect(auth.impostaNuovaPassword).not.toHaveBeenCalled();
    expect(elemento.querySelector('.campo-errore')?.textContent).toContain(
      'Le password non coincidono',
    );
  });

  it('salva, avvisa e rimanda all’accesso', async () => {
    auth.impostaNuovaPassword.mockReturnValue(of(null));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { invia } = await crea('abc');

    await invia('segreta-123', 'segreta-123');

    expect(auth.impostaNuovaPassword).toHaveBeenCalledWith({
      token: 'abc',
      password: 'segreta-123',
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('Password aggiornata', 'successo');
    expect(naviga).toHaveBeenCalledWith('/accesso');
  });
});

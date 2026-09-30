import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { VerificaEmailComponent } from './verifica-email-component';

describe('VerificaEmailComponent', () => {
  const auth = { verificaEmail: vi.fn(), richiediCodiceVerifica: vi.fn() };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ verifica: { fatta: 'Email verificata' } })],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(VerificaEmailComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const invia = async (codice: string) => {
      const campo = elemento.querySelector('input')!;
      campo.value = codice;
      campo.dispatchEvent(new Event('input'));
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, elemento, invia };
  }

  it('non invia un codice che non ha 6 cifre', async () => {
    const { invia } = await crea();

    await invia('12a45');

    expect(auth.verificaEmail).not.toHaveBeenCalled();
  });

  it('verifica il codice e avvisa', async () => {
    auth.verificaEmail.mockReturnValue(of(null));
    const { invia } = await crea();

    await invia('123456');

    expect(auth.verificaEmail).toHaveBeenCalledWith('123456');
    expect(avvisi.mostra).toHaveBeenCalledWith('Email verificata', 'successo');
  });

  it('chiede un nuovo codice e conferma l’invio', async () => {
    auth.richiediCodiceVerifica.mockReturnValue(of(null));
    const { fixture, elemento } = await crea();

    elemento.querySelector<HTMLButtonElement>('button[type="button"]')?.click();
    await fixture.whenStable();

    expect(auth.richiediCodiceVerifica).toHaveBeenCalled();
    expect(elemento.querySelector('.esito-ok')).not.toBeNull();
  });
});

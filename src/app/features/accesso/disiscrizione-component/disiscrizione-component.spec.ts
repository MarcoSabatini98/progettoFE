import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { DisiscrizioneComponent } from './disiscrizione-component';

describe('DisiscrizioneComponent', () => {
  const auth = { disiscrivi: vi.fn() };

  beforeEach(() => {
    auth.disiscrivi.mockReset();
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          disiscrizione: { fatto: 'Fatto', linkNonValido: 'Link non valido' },
          errori: { LINK_NON_VALIDO: 'Link alterato' },
        }),
      ],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  async function apri(token?: string): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(DisiscrizioneComponent);
    if (token) {
      fixture.componentRef.setInput('token', token);
    }
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('aprendo il link revoca il consenso senza altri clic', async () => {
    auth.disiscrivi.mockReturnValue(of(null));

    const elemento = await apri('uuid.firma');

    expect(auth.disiscrivi).toHaveBeenCalledWith('uuid.firma');
    expect(elemento.querySelector('.esito-ok')?.textContent).toContain('Fatto');
    expect(elemento.querySelector('a.collegamento')).not.toBeNull();
  });

  it('senza token non chiama il backend', async () => {
    const elemento = await apri();

    expect(auth.disiscrivi).not.toHaveBeenCalled();
    expect(elemento.querySelector('.non-valido')?.textContent).toContain('Link non valido');
  });

  it('con la firma alterata mostra l’errore del backend', async () => {
    auth.disiscrivi.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { successo: false, errore: { codice: 'LINK_NON_VALIDO', messaggio: 'x' } },
          }),
      ),
    );

    const elemento = await apri('uuid.falsa');

    expect(elemento.querySelector('.non-valido')?.textContent).toContain('Link alterato');
  });
});

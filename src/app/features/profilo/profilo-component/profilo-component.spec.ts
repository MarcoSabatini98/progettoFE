import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import { ProfiloComponent } from './profilo-component';

describe('ProfiloComponent', () => {
  const utente = signal({
    email: 'anna@esempio.it',
    ruolo: 'cliente' as CodiceRuolo,
    email_verificata: false,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            utente,
            haRuolo: (ruoli: readonly CodiceRuolo[]) => ruoli.includes(utente().ruolo),
          },
        },
        {
          provide: UtentiService,
          useValue: {
            leggiProfilo: () =>
              of({ nome: 'Anna', cognome: 'Rossi', lingua: 'it', notifiche_email: true }),
          },
        },
      ],
    });
  });

  async function crea(ruolo: CodiceRuolo, verificata: boolean) {
    utente.update((u) => ({ ...u, ruolo, email_verificata: verificata }));
    const fixture = TestBed.createComponent(ProfiloComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('al cliente da verificare mostra tutte le sezioni', async () => {
    const elemento = await crea('cliente', false);

    expect(elemento.querySelector('.email')?.textContent).toContain('anna@esempio.it');
    for (const sezione of [
      'app-verifica-email',
      'app-dati-personali',
      'app-preferenze-email',
      'app-sicurezza',
      'app-elimina-account',
    ]) {
      expect(elemento.querySelector(sezione), sezione).not.toBeNull();
    }
  });

  it('allo staff verificato non propone verifica né eliminazione', async () => {
    const elemento = await crea('receptionist', true);

    expect(elemento.querySelector('app-verifica-email')).toBeNull();
    expect(elemento.querySelector('app-elimina-account')).toBeNull();
    expect(elemento.querySelector('app-sicurezza')).not.toBeNull();
  });
});

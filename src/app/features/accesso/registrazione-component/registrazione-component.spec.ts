import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RegistrazioneComponent } from './registrazione-component';

describe('RegistrazioneComponent', () => {
  const auth = { registra: vi.fn() };

  beforeEach(() => {
    auth.registra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ moduli: { required: 'Campo obbligatorio' } })],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: LinguaService, useValue: { attiva: () => 'fr' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(RegistrazioneComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = (nome: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(`input[formControlName="${nome}"]`);
      campo!.value = valore;
      campo!.dispatchEvent(new Event('input'));
    };
    const compila = () => {
      scrivi('nome', 'Anna');
      scrivi('cognome', 'Rossi');
      scrivi('email', 'anna@esempio.it');
      const [password, conferma] = elemento.querySelectorAll<HTMLInputElement>(
        'app-nuova-password input',
      );
      for (const campo of [password, conferma]) {
        campo.value = 'segreta-123';
        campo.dispatchEvent(new Event('input'));
      }
    };
    const accetta = () =>
      elemento
        .querySelectorAll<HTMLInputElement>('.consenso input[required]')
        .forEach((casella) => casella.click());
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, compila, accetta, invia };
  }

  it('senza privacy e termini non registra e segnala i consensi', async () => {
    const { elemento, compila, invia } = await crea();

    compila();
    await invia();

    expect(auth.registra).not.toHaveBeenCalled();
    expect(elemento.querySelectorAll('.consenso-errore')).toHaveLength(2);
  });

  it('registra nella lingua del sito e apre l’area personale', async () => {
    auth.registra.mockReturnValue(of({}));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { compila, accetta, invia } = await crea();

    compila();
    accetta();
    await invia();

    expect(auth.registra).toHaveBeenCalledWith({
      nome: 'Anna',
      cognome: 'Rossi',
      email: 'anna@esempio.it',
      telefono: '',
      password: 'segreta-123',
      lingua: 'fr',
      consensi: { privacy: true, termini: true, marketing: false },
    });
    expect(naviga).toHaveBeenCalledWith('/area-personale');
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../core/services/auth/auth-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { CodiceRuolo } from '../models/ruolo/ruolo-model';
import { MenuUtenteComponent } from './menu-utente-component';

describe('MenuUtenteComponent', () => {
  const utente = signal({
    nome: 'Anna',
    cognome: 'Rossi',
    ruolo: 'receptionist' as CodiceRuolo,
    colore_avatar: '#5e6b3a',
  });
  const auth = {
    utente,
    haRuolo: (ruoli: readonly CodiceRuolo[]) => ruoli.includes(utente().ruolo),
    esci: vi.fn(() => of(null)),
  };

  beforeEach(() => {
    utente.update((u) => ({ ...u, ruolo: 'receptionist' }));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  async function crea(area: 'pubblica' | 'staff') {
    const fixture = TestBed.createComponent(MenuUtenteComponent);
    fixture.componentRef.setInput('area', area);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const voci = () => [...elemento.querySelectorAll<HTMLElement>('[ngMenuItem]')];
    return { fixture, elemento, voci };
  }

  async function apri(fixture: Awaited<ReturnType<typeof crea>>['fixture']) {
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
  }

  it("mostra le iniziali dell'utente", async () => {
    const { elemento } = await crea('pubblica');
    expect(elemento.querySelector('.avatar')?.textContent?.trim()).toBe('AR');
  });

  it('dal sito porta lo staff al gestionale', async () => {
    const { fixture, voci } = await crea('pubblica');
    await apri(fixture);
    const navigazione = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');

    voci()[1].click();

    expect(navigazione).toHaveBeenCalledWith('/staff');
  });

  it('dal gestionale offre il proprio account e il ritorno al sito', async () => {
    const { fixture, voci } = await crea('staff');
    await apri(fixture);

    expect(voci().map((voce) => voce.textContent?.trim())).toEqual([
      'menu.utente.account',
      'menu.utente.sito',
      'menu.utente.esci',
    ]);
  });

  it("al cliente offre solo l'area personale", async () => {
    utente.update((u) => ({ ...u, ruolo: 'cliente' }));
    const { fixture, voci } = await crea('pubblica');
    await apri(fixture);

    expect(voci()[0].textContent).toContain('menu.utente.personale');
    expect(voci()).toHaveLength(2);
  });

  it('esce e torna alla home', async () => {
    const { fixture, voci } = await crea('staff');
    await apri(fixture);
    const navigazione = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');

    voci()[2].click();

    expect(auth.esci).toHaveBeenCalled();
    expect(navigazione).toHaveBeenCalledWith('/');
  });
});

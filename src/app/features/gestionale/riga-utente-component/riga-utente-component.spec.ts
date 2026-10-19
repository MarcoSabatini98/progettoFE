import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { UtenteInterface } from '../../../shared/models/utente/utente-model';
import { RigaUtenteComponent } from './riga-utente-component';

describe('RigaUtenteComponent', () => {
  const utente = {
    id: 3,
    nome: 'Anna',
    cognome: 'Rossi',
    email: 'anna@esempio.it',
    ruolo: 'receptionist',
    attivo: true,
  } as UtenteInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([])],
    });
  });

  async function crea(dati: UtenteInterface) {
    const fixture = TestBed.createComponent(RigaUtenteComponent);
    fixture.componentRef.setInput('utente', dati);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('porta alla scheda con iniziali, nome, email e ruolo', async () => {
    const elemento = await crea(utente);

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/utenti/3');
    expect(elemento.querySelector('.camera')?.textContent?.trim()).toBe('AR');
    expect(elemento.textContent).toContain('Rossi Anna');
    expect(elemento.textContent).toContain('anna@esempio.it');
    expect(elemento.textContent).toContain('gestionale.ruoli.receptionist');
    expect(elemento.querySelector('[data-stato=disattivato]')).toBeNull();
  });

  it("segnala l'account disattivato", async () => {
    const elemento = await crea({ ...utente, attivo: false });

    expect(elemento.querySelector('[data-stato=disattivato]')).not.toBeNull();
  });
});

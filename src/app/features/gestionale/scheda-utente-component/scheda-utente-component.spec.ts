import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { SchedaUtenteComponent } from './scheda-utente-component';

describe('SchedaUtenteComponent', () => {
  const utenti = { leggiUtente: vi.fn(), eliminaUtente: vi.fn(), aggiornaUtente: vi.fn() };
  const sessione = signal<{ id: number } | null>({ id: 1 });
  const utente = {
    id: 3,
    email: 'anna@esempio.it',
    nome: 'Anna',
    cognome: 'Rossi',
    telefono: null,
    lingua: 'it',
    ruolo: 'receptionist',
    attivo: true,
    ospite_id: null,
    creato_il: '2030-01-10T09:00:00Z',
    email_verificata_il: null,
    ultimo_accesso_il: null,
  };

  beforeEach(() => {
    Object.values(utenti).forEach((spia) => spia.mockReset());
    utenti.leggiUtente.mockReturnValue(of(utente));
    sessione.set({ id: 1 });
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: UtentiService, useValue: utenti },
        { provide: AuthService, useValue: { utente: sessione } },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SchedaUtenteComponent);
    fixture.componentRef.setInput('id', '3');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it("mostra dati, accessi ed eliminazione dell'account", async () => {
    const elemento = await crea();

    expect(utenti.leggiUtente).toHaveBeenCalledWith(3);
    expect(elemento.querySelector('h1')?.textContent).toContain('Anna Rossi');
    expect(elemento.querySelector('app-dati-utente')).not.toBeNull();
    expect(elemento.querySelector('.dati')?.textContent).toContain('10 gennaio 2030');
    expect(elemento.querySelector('.dati')?.textContent).toContain('gestionale.utenti.accessi.mai');
    expect(elemento.querySelector('app-elimina')).not.toBeNull();
  });

  it('il proprio account non si elimina da qui', async () => {
    sessione.set({ id: 3 });
    const elemento = await crea();

    expect(elemento.querySelector('app-elimina')).toBeNull();
  });

  it("se l'account non esiste lo dice", async () => {
    utenti.leggiUtente.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { errore: { codice: 'UTENTE_NON_TROVATO', messaggio: 'Non trovato' } },
          }),
      ),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Non trovato');
  });
});

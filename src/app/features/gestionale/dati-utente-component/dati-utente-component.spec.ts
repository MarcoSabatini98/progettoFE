import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { UtenteInterface } from '../../../shared/models/utente/utente-model';
import { DatiUtenteComponent } from './dati-utente-component';

describe('DatiUtenteComponent', () => {
  const utenti = { aggiornaUtente: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const staff = {
    id: 3,
    nome: 'Anna',
    cognome: 'Rossi',
    telefono: null,
    lingua: 'it',
    ruolo: 'receptionist',
    attivo: true,
    ospite_id: null,
  } as UtenteInterface;

  beforeEach(() => {
    utenti.aggiornaUtente.mockReset();
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: UtentiService, useValue: utenti },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea(utente: UtenteInterface) {
    const fixture = TestBed.createComponent(DatiUtenteComponent);
    fixture.componentRef.setInput('utente', utente);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, elemento, salva };
  }

  const opzioniRuolo = (elemento: HTMLElement) =>
    [...elemento.querySelectorAll<HTMLOptionElement>('[formControlName=ruolo] option')].map(
      (opzione) => opzione.value,
    );

  it('salva solo i campi cambiati e avvisa', async () => {
    utenti.aggiornaUtente.mockReturnValue(of(staff));
    const { fixture, elemento, salva } = await crea(staff);
    const ruolo = elemento.querySelector<HTMLSelectElement>('[formControlName=ruolo]')!;
    ruolo.value = 'housekeeper';
    ruolo.dispatchEvent(new Event('change'));
    elemento.querySelector<HTMLInputElement>('[formControlName=attivo]')!.click();
    const salvato = vi.fn();
    fixture.componentInstance.salvato.subscribe(salvato);

    await salva();

    expect(utenti.aggiornaUtente).toHaveBeenCalledWith(3, {
      ruolo: 'housekeeper',
      attivo: false,
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.utenti.salvato', 'successo');
    expect(salvato).toHaveBeenCalledWith(staff);
  });

  it('senza modifiche non chiama il backend', async () => {
    const { salva } = await crea(staff);

    await salva();

    expect(utenti.aggiornaUtente).not.toHaveBeenCalled();
  });

  it("propone l'amministratore solo a chi lo è già", async () => {
    const { elemento: receptionist } = await crea(staff);
    expect(opzioniRuolo(receptionist)).not.toContain('admin');

    const { elemento: admin } = await crea({ ...staff, ruolo: 'admin' });
    expect(opzioniRuolo(admin)).toContain('admin');
  });

  it('di un cliente cambia solo lo stato e rimanda alla scheda ospite', async () => {
    const { elemento } = await crea({ ...staff, ruolo: 'cliente', ospite_id: 8 });

    expect(elemento.querySelector('[formControlName=nome]')).toBeNull();
    expect(elemento.querySelector('[formControlName=ruolo]')).toBeNull();
    expect(elemento.querySelector('[formControlName=attivo]')).not.toBeNull();
    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/ospiti/8');
  });

  it('mostra il rifiuto del backend', async () => {
    utenti.aggiornaUtente.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'ULTIMO_ADMIN', messaggio: 'Resta almeno un admin' } },
          }),
      ),
    );
    const { elemento, salva } = await crea({ ...staff, ruolo: 'admin' });
    elemento.querySelector<HTMLInputElement>('[formControlName=attivo]')!.click();

    await salva();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Resta almeno un admin');
  });
});

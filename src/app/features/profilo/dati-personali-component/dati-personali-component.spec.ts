import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { UtenteInterface } from '../../../shared/models/utente/utente-model';
import { DatiPersonaliComponent } from './dati-personali-component';

describe('DatiPersonaliComponent', () => {
  const utenti = { aggiornaProfilo: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const lingua = { disponibili: signal(['it', 'en']), imposta: vi.fn() };
  const profilo = {
    nome: 'Anna',
    cognome: 'Rossi',
    telefono: null,
    lingua: 'it',
  } as UtenteInterface;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ profilo: { salvato: 'Dati salvati' } })],
      providers: [
        { provide: UtentiService, useValue: utenti },
        { provide: AvvisiService, useValue: avvisi },
        { provide: LinguaService, useValue: lingua },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(DatiPersonaliComponent);
    fixture.componentRef.setInput('profilo', profilo);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('parte dai dati del profilo', async () => {
    const { elemento } = await crea();

    const nome = elemento.querySelector<HTMLInputElement>('input[formControlName="nome"]');
    expect(nome?.value).toBe('Anna');
    expect(elemento.querySelector<HTMLSelectElement>('select')?.value).toBe('it');
  });

  it('salva e passa il sito alla lingua scelta', async () => {
    utenti.aggiornaProfilo.mockReturnValue(of({ ...profilo, lingua: 'en' }));
    const { fixture, elemento } = await crea();
    const select = elemento.querySelector('select')!;

    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(utenti.aggiornaProfilo).toHaveBeenCalledWith({
      nome: 'Anna',
      cognome: 'Rossi',
      telefono: '',
      lingua: 'en',
    });
    expect(lingua.imposta).toHaveBeenCalledWith('en');
    expect(avvisi.mostra).toHaveBeenCalledWith('Dati salvati', 'successo');
  });
});

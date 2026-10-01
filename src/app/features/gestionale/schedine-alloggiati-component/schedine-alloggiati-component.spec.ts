import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlloggiatiService } from '../../../core/services/alloggiati/alloggiati-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { SchedineAlloggiatiComponent } from './schedine-alloggiati-component';

describe('SchedineAlloggiatiComponent', () => {
  const alloggiati = { leggiScheda: vi.fn(), registraInvio: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const anna = {
    ospite_id: 3,
    nome: 'Anna',
    cognome: 'Verdi',
    tipo_alloggiato: 'capofamiglia',
    campi_mancanti: ['sesso', 'data_nascita'],
    schedina: null,
    ultimo_invio: null,
  };
  const scheda = {
    prenotazione: { id: 7, codice: 'BB-7', stato: 'in_corso', data_arrivo: '2030-06-01' },
    completa: false,
    ospiti: [anna],
  };

  beforeEach(() => {
    Object.values(alloggiati).forEach((spia) => spia.mockReset());
    avvisi.mostra.mockReset();
    alloggiati.leggiScheda.mockReturnValue(of(scheda));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: AlloggiatiService, useValue: alloggiati },
        { provide: AvvisiService, useValue: avvisi },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SchedineAlloggiatiComponent);
    fixture.componentRef.setInput('prenotazioneId', '7');
    const registrato = vi.fn();
    fixture.componentInstance.registrato.subscribe(registrato);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const registra = async (esito: string, messaggio: string) => {
      const scelta = elemento.querySelector('select')!;
      scelta.value = esito;
      scelta.dispatchEvent(new Event('change'));
      const testo = elemento.querySelector('textarea')!;
      testo.value = messaggio;
      testo.dispatchEvent(new Event('input'));
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, registrato, registra };
  }

  it("mostra a ogni ospite cosa manca, con il link all'anagrafica", async () => {
    const { elemento } = await crea();

    expect(alloggiati.leggiScheda).toHaveBeenCalledWith(7);
    expect(elemento.querySelector('.esito-errore')?.textContent).toContain(
      'gestionale.schedine.incomplete',
    );
    expect(elemento.querySelector('.ospiti a')?.getAttribute('href')).toBe('/staff/ospiti/3');
    expect(elemento.querySelector('.mancano')?.textContent).toContain('anagrafica.campi.sesso');
  });

  it("registra l'esito del portale e lo mostra sotto l'ospite", async () => {
    const invio = { esito: 'errore', messaggio: 'Riga 2 errata', inviato_il: '2030-06-01T10:00' };
    alloggiati.registraInvio.mockReturnValue(
      of({ ...scheda, ospiti: [{ ...anna, ultimo_invio: invio }] }),
    );
    const { elemento, registrato, registra } = await crea();

    await registra('errore', 'Riga 2 errata');

    expect(alloggiati.registraInvio).toHaveBeenCalledWith(7, {
      esito: 'errore',
      messaggio: 'Riga 2 errata',
    });
    expect(elemento.querySelector('.ospiti li')?.textContent).toContain('Riga 2 errata');
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.schedine.registrato', 'successo');
    expect(registrato).toHaveBeenCalledOnce();
  });

  it('senza messaggio lo manda vuoto; se il backend rifiuta lo spiega', async () => {
    alloggiati.registraInvio.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { errore: { codice: 'PRENOTAZIONE_NON_TROVATA', messaggio: 'Non trovata' } },
          }),
      ),
    );
    const { elemento, registrato, registra } = await crea();

    await registra('inviata', '');

    expect(alloggiati.registraInvio).toHaveBeenCalledWith(7, { esito: 'inviata', messaggio: null });
    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Non trovata');
    expect(registrato).not.toHaveBeenCalled();
  });
});

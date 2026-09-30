import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { AlloggiatiService } from '../../../core/services/alloggiati/alloggiati-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { CercaLuogoComponent } from '../../../shared/cerca-luogo-component/cerca-luogo-component';
import { CheckinOnlineComponent } from './checkin-online-component';

describe('CheckinOnlineComponent', () => {
  const prenotazioni = { leggiCheckinOnline: vi.fn(), inviaCheckinOnline: vi.fn() };
  const alloggiati = { cercaLuoghi: vi.fn() };
  const italia = { codice: '100000100', descrizione: 'ITALIA', provincia: null, tipo: 'stato' };
  const roma = { codice: '412058091', descrizione: 'ROMA', provincia: 'RM', tipo: 'comune' };
  const soggiorno = {
    codice: 'BB-7',
    data_arrivo: '2030-07-01',
    data_partenza: '2030-07-04',
    adulti: 2,
    bambini: 0,
    checkin_online_il: null,
    ospiti: [
      {
        nome: 'Anna',
        cognome: 'Rossi',
        tipo_alloggiato: 'capofamiglia',
        campi_mancanti: ['numero_documento'],
      },
    ],
  };

  beforeEach(() => {
    Object.values(prenotazioni).forEach((spia) => spia.mockReset());
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: AlloggiatiService, useValue: alloggiati },
      ],
    });
  });

  async function crea(token?: string) {
    const fixture = TestBed.createComponent(CheckinOnlineComponent);
    fixture.componentRef.setInput('token', token);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = (fieldset: number, nome: string, valore: string) => {
      const campo = elemento
        .querySelectorAll('fieldset')
        [fieldset].querySelector<HTMLInputElement | HTMLSelectElement>(
          `[formcontrolname="${nome}"]`,
        )!;
      campo.value = valore;
      campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input'));
    };
    // La ricerca dei luoghi ha il suo test: qui basta il luogo che il campo emette.
    const scegli = async (fieldset: number, etichetta: string, luogo: object | null) => {
      fixture.debugElement
        .queryAll(By.directive(CercaLuogoComponent))
        .map((campo) => campo.componentInstance as CercaLuogoComponent)
        .filter((campo) => campo.etichetta() === etichetta)
        [fieldset].scelto.emit(luogo as never);
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, scrivi, scegli, invia };
  }

  it('senza token dice che il link non vale e non chiama il backend', async () => {
    const { elemento } = await crea();

    expect(prenotazioni.leggiCheckinOnline).not.toHaveBeenCalled();
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
      'errori.LINK_CHECKIN_NON_VALIDO',
    );
  });

  it('una riga per ospite: di chi è registrato solo il nome e cosa manca; documento al primo', async () => {
    prenotazioni.leggiCheckinOnline.mockReturnValue(of(soggiorno));

    const { elemento } = await crea('abc');

    expect(prenotazioni.leggiCheckinOnline).toHaveBeenCalledWith('abc');
    const righe = elemento.querySelectorAll('fieldset');
    expect(righe).toHaveLength(2);
    expect(righe[0].querySelector<HTMLInputElement>('[formcontrolname="nome"]')?.value).toBe(
      'Anna',
    );
    expect(righe[0].querySelector<HTMLSelectElement>('[formcontrolname="sesso"]')?.value).toBe('');
    expect(righe[0].querySelector('.mancanti')?.textContent).toContain(
      'portale.checkin.campi.numero_documento',
    );
    expect(righe[1].querySelector('.registrato')).toBeNull();
    expect(righe[0].querySelector('[formcontrolname="tipo_documento"]')).not.toBeNull();
    expect(righe[1].querySelector('[formcontrolname="tipo_documento"]')).toBeNull();
    expect(
      [...righe[0].querySelectorAll('[formcontrolname="tipo_documento"] option')]
        .map((opzione) => opzione.getAttribute('value'))
        .filter(Boolean),
    ).toEqual(['IDENT', 'IDELE', 'PASOR', 'PATEN']);
  });

  it('senza nome e cognome non invia', async () => {
    prenotazioni.leggiCheckinOnline.mockReturnValue(of(soggiorno));
    const { elemento, invia } = await crea('abc');

    await invia();

    expect(prenotazioni.inviaCheckinOnline).not.toHaveBeenCalled();
    expect(elemento.querySelector('.campo-errore')).not.toBeNull();
  });

  it('invia solo i campi compilati e conferma il check-in', async () => {
    prenotazioni.leggiCheckinOnline.mockReturnValue(of(soggiorno));
    prenotazioni.inviaCheckinOnline.mockReturnValue(
      of({ ...soggiorno, checkin_online_il: '2030-06-28T09:00:00Z' }),
    );
    const { elemento, scrivi, scegli, invia } = await crea('abc');

    scrivi(0, 'tipo_documento', 'PASOR');
    await scegli(0, 'portale.checkin.campi.stato_nascita_codice', italia);
    await scegli(0, 'portale.checkin.campi.comune_nascita_codice', roma);
    scrivi(0, 'numero_documento', 'YA1234567');
    scrivi(1, 'nome', 'Luca');
    scrivi(1, 'cognome', 'Bianchi');
    await invia();

    expect(prenotazioni.inviaCheckinOnline).toHaveBeenCalledWith('abc', {
      ospiti: [
        {
          ospite: {
            nome: 'Anna',
            cognome: 'Rossi',
            stato_nascita_codice: '100000100',
            comune_nascita_codice: '412058091',
            provincia_nascita: 'RM',
            tipo_documento: 'PASOR',
            numero_documento: 'YA1234567',
          },
          tipo_alloggiato: 'capofamiglia',
        },
        { ospite: { nome: 'Luca', cognome: 'Bianchi' } },
      ],
    });
    expect(elemento.querySelector('.esito-ok')?.textContent).toContain('portale.checkin.fatto');
  });

  it('il comune di nascita compare solo per chi è nato in Italia', async () => {
    prenotazioni.leggiCheckinOnline.mockReturnValue(of({ ...soggiorno, adulti: 1 }));
    const { elemento, scegli } = await crea('abc');
    const comuni = () => elemento.querySelectorAll('app-cerca-luogo').length;

    expect(comuni()).toBe(3);
    await scegli(0, 'portale.checkin.campi.stato_nascita_codice', italia);
    expect(comuni()).toBe(4);
    await scegli(0, 'portale.checkin.campi.stato_nascita_codice', null);
    expect(comuni()).toBe(3);
  });

  it('se il backend rifiuta spiega perché', async () => {
    prenotazioni.leggiCheckinOnline.mockReturnValue(of({ ...soggiorno, adulti: 1 }));
    prenotazioni.inviaCheckinOnline.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'PRENOTAZIONE_CHIUSA', messaggio: 'Cancellata' } },
          }),
      ),
    );
    const { elemento, invia } = await crea('abc');

    await invia();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Cancellata');
  });
});

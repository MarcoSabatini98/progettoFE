import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { CheckinOnlineComponent } from './checkin-online-component';

describe('CheckinOnlineComponent', () => {
  const prenotazioni = { leggiCheckinOnline: vi.fn(), inviaCheckinOnline: vi.fn() };
  const soggiorno = {
    codice: 'BB-7',
    data_arrivo: '2030-07-01',
    data_partenza: '2030-07-04',
    adulti: 2,
    bambini: 0,
    checkin_online_il: null,
    ospiti: [{ nome: 'Anna', cognome: 'Rossi', sesso: 'F', data_nascita: '1990-05-02' }],
  };

  beforeEach(() => {
    Object.values(prenotazioni).forEach((spia) => spia.mockReset());
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
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
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, scrivi, invia };
  }

  it('senza token dice che il link non vale e non chiama il backend', async () => {
    const { elemento } = await crea();

    expect(prenotazioni.leggiCheckinOnline).not.toHaveBeenCalled();
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
      'errori.LINK_CHECKIN_NON_VALIDO',
    );
  });

  it('una riga per ospite, già compilata; il documento solo per il primo', async () => {
    prenotazioni.leggiCheckinOnline.mockReturnValue(of(soggiorno));

    const { elemento } = await crea('abc');

    expect(prenotazioni.leggiCheckinOnline).toHaveBeenCalledWith('abc');
    const righe = elemento.querySelectorAll('fieldset');
    expect(righe).toHaveLength(2);
    expect(righe[0].querySelector<HTMLInputElement>('[formcontrolname="nome"]')?.value).toBe(
      'Anna',
    );
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
    const { elemento, scrivi, invia } = await crea('abc');

    scrivi(0, 'tipo_documento', 'PASOR');
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
            sesso: 'F',
            data_nascita: '1990-05-02',
            tipo_documento: 'PASOR',
            numero_documento: 'YA1234567',
          },
        },
        { ospite: { nome: 'Luca', cognome: 'Bianchi' } },
      ],
    });
    expect(elemento.querySelector('.esito-ok')?.textContent).toContain('portale.checkin.fatto');
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

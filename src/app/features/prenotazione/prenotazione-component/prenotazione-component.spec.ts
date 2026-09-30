import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { RiepilogoPagamentoInterface } from '../../../shared/models/riepilogo-pagamento/riepilogo-pagamento-model';
import { PrenotazioneComponent } from './prenotazione-component';

describe('PrenotazioneComponent', () => {
  const prenotazioni = { accediPerCodice: vi.fn() };
  const pagamenti = { leggiRiepilogoPerCodice: vi.fn(), pagaPerCodice: vi.fn() };
  const prenotazione = {
    codice: 'BB-123',
    stato: 'in_attesa',
    data_arrivo: '2030-07-01',
    data_partenza: '2030-07-04',
    adulti: 2,
    bambini: 0,
    scade_il: '2030-06-30T10:15:00',
    importo_soggiorno: 300,
    totale: 300,
    acconto_richiesto: 90,
    camera: { tipologia: { nome: 'Doppia' } },
  } as unknown as PrenotazioneInterface;
  const riepilogo: RiepilogoPagamentoInterface = {
    dovuto: 300,
    incassato: 0,
    rimborsato: 0,
    saldo: 300,
    acconto_richiesto: 90,
    da_pagare_ora: 90,
    metodi_online: ['stripe', 'paypal'],
    bonifico: { iban: 'IT60X0542811101000000123456', intestatario: null, causale: 'BB-123' },
  };
  const accesso = { codice: 'BB-123', email: 'anna@esempio.it' };

  beforeEach(() => {
    [prenotazioni.accediPerCodice, ...Object.values(pagamenti)].forEach((spia) => spia.mockReset());
    prenotazioni.accediPerCodice.mockReturnValue(of(prenotazione));
    pagamenti.leggiRiepilogoPerCodice.mockReturnValue(of(riepilogo));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: PagamentiService, useValue: pagamenti },
        { provide: AuthService, useValue: { utente: () => null } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(stato: unknown = null) {
    vi.spyOn(TestBed.inject(Location), 'getState').mockReturnValue(stato);
    const fixture = TestBed.createComponent(PrenotazioneComponent);
    fixture.componentRef.setInput('codice', 'BB-123');
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const accedi = async (email: string) => {
      const campo = elemento.querySelector<HTMLInputElement>('[formControlName="email"]')!;
      campo.value = email;
      campo.dispatchEvent(new Event('input'));
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLElement>(selettore)?.click();
      await fixture.whenStable();
    };
    return { elemento, accedi, clicca };
  }

  it('arrivando dalla conferma apre subito prenotazione, conto e modi di pagare', async () => {
    const { elemento } = await crea({ email: accesso.email });

    expect(prenotazioni.accediPerCodice).toHaveBeenCalledWith(accesso);
    expect(pagamenti.leggiRiepilogoPerCodice).toHaveBeenCalledWith(accesso);
    expect(elemento.querySelector('form')).toBeNull();
    expect(elemento.querySelector('.stato')?.textContent).toContain('prenotazione.stati.in_attesa');
    expect(elemento.querySelectorAll('.metodi button')).toHaveLength(2);
    expect(elemento.querySelector('.iban')?.textContent).toContain('IT60X0542811101000000123456');
  });

  it('senza email la chiede prima di aprire la prenotazione', async () => {
    const { elemento, accedi } = await crea();
    expect(prenotazioni.accediPerCodice).not.toHaveBeenCalled();

    await accedi('non-una-email');
    expect(prenotazioni.accediPerCodice).not.toHaveBeenCalled();

    await accedi(accesso.email);
    expect(prenotazioni.accediPerCodice).toHaveBeenCalledWith(accesso);
    expect(elemento.querySelector('.stato')).not.toBeNull();
  });

  it('con codice ed email che non corrispondono resta sul modulo col motivo', async () => {
    prenotazioni.accediPerCodice.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { errore: { codice: 'PRENOTAZIONE_NON_TROVATA', messaggio: 'Non trovata' } },
          }),
      ),
    );
    const { elemento } = await crea({ email: 'altra@esempio.it' });

    expect(elemento.querySelector('form')).not.toBeNull();
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Non trovata');
  });

  it('pagare porta alla pagina del provider, o spiega perché non si può', async () => {
    pagamenti.pagaPerCodice.mockReturnValue(of({ url: '#pagamento' }));
    const { elemento, clicca } = await crea({ email: accesso.email });

    await clicca('.metodi button');
    expect(pagamenti.pagaPerCodice).toHaveBeenCalledWith({ ...accesso, metodo: 'stripe' });
    expect(window.location.hash).toBe('#pagamento');

    pagamenti.pagaPerCodice.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'NULLA_DA_PAGARE', messaggio: 'Già pagata' } },
          }),
      ),
    );
    await clicca('.metodi button:last-child');
    expect(pagamenti.pagaPerCodice).toHaveBeenLastCalledWith({ ...accesso, metodo: 'paypal' });
    expect(elemento.querySelector('.pagamento [role="alert"]')?.textContent).toContain(
      'Già pagata',
    );
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { RiepilogoPagamentoInterface } from '../models/riepilogo-pagamento/riepilogo-pagamento-model';
import { PagamentoPrenotazioneComponent } from './pagamento-prenotazione-component';

describe('PagamentoPrenotazioneComponent', () => {
  const riepilogo: RiepilogoPagamentoInterface = {
    dovuto: 300,
    incassato: 0,
    rimborsato: 0,
    saldo: 300,
    acconto_richiesto: 90,
    da_pagare_ora: 90,
    metodi_online: ['stripe', 'paypal'],
    bonifico: { iban: 'IT60X0542811101000000123456', intestatario: 'Casa Mare', causale: 'BB-1' },
  };
  const avvia = vi.fn();

  beforeEach(() => {
    avvia.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => 'EUR' } },
      ],
    });
  });

  async function crea(dati: RiepilogoPagamentoInterface, scadeIl: string | null = null) {
    const fixture = TestBed.createComponent(PagamentoPrenotazioneComponent);
    fixture.componentRef.setInput('riepilogo', dati);
    fixture.componentRef.setInput('avvia', avvia);
    fixture.componentRef.setInput('scadeIl', scadeIl);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLElement>(selettore)?.click();
      await fixture.whenStable();
    };
    return { elemento, clicca };
  }

  it('sceglie quanto e come pagare: acconto con carta, poi tutto con PayPal', async () => {
    avvia.mockReturnValue(of({ url: '#provider' }));
    const { elemento, clicca } = await crea(riepilogo);

    expect(elemento.querySelectorAll('input[name="quanto"]')).toHaveLength(2);
    expect(elemento.querySelectorAll('input[name="metodo"]')).toHaveLength(3);
    expect(elemento.querySelector('.resto')).not.toBeNull();

    await clicca('.paga');
    expect(avvia).toHaveBeenCalledWith({ metodo: 'stripe', importo: 90 });
    expect(window.location.hash).toBe('#provider');

    await clicca('input[name="quanto"][value="300"]');
    await clicca('input[name="metodo"][value="paypal"]');
    expect(elemento.querySelector('.resto')).toBeNull();
    await clicca('.paga');
    expect(avvia).toHaveBeenLastCalledWith({ metodo: 'paypal', importo: 300 });
  });

  it('se il provider rifiuta spiega perché', async () => {
    avvia.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'NULLA_DA_PAGARE', messaggio: 'Già pagata' } },
          }),
      ),
    );
    const { elemento, clicca } = await crea(riepilogo);

    await clicca('.paga');
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Già pagata');
  });

  it('bonifico: mostra i dati e la scadenza al posto del pulsante', async () => {
    const { elemento, clicca } = await crea(riepilogo, '2030-06-30T10:15:00');

    await clicca('input[name="metodo"][value="bonifico"]');

    expect(elemento.querySelector('.paga')).toBeNull();
    expect(elemento.querySelector('.iban')?.textContent).toContain('IT60X0542811101000000123456');
    expect(elemento.querySelector('.scadenza')).not.toBeNull();
  });

  it('senza metodi attivi dice di contattare la struttura', async () => {
    const { elemento } = await crea({ ...riepilogo, metodi_online: [], bonifico: null });

    expect(elemento.querySelector('.paga')).toBeNull();
    expect(elemento.querySelector('.esito-avviso')).not.toBeNull();
  });

  it('saldato dice che è tutto pagato; senza acconto propone il saldo, da pagare anche in struttura', async () => {
    const pagato = await crea({ ...riepilogo, da_pagare_ora: 0, saldo: 0 });
    expect(pagato.elemento.querySelector('.esito-ok')).not.toBeNull();

    const inStruttura = await crea({ ...riepilogo, da_pagare_ora: 0, saldo: 210 });
    expect(inStruttura.elemento.hidden).toBe(false);
    expect(inStruttura.elemento.querySelector('input[name="quanto"]')).toBeNull();
    expect(inStruttura.elemento.querySelector('.esito-avviso')).not.toBeNull();
  });

  it('pagamento in eccesso: non mostra nulla', async () => {
    const { elemento } = await crea({ ...riepilogo, da_pagare_ora: 0, saldo: -20 });
    expect(elemento.hidden).toBe(true);
  });
});

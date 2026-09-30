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

  async function crea(dati: RiepilogoPagamentoInterface) {
    const fixture = TestBed.createComponent(PagamentoPrenotazioneComponent);
    fixture.componentRef.setInput('riepilogo', dati);
    fixture.componentRef.setInput('avvia', avvia);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLElement>(selettore)?.click();
      await fixture.whenStable();
    };
    return { elemento, clicca };
  }

  it('mostra metodi online e bonifico', async () => {
    const { elemento } = await crea(riepilogo);

    expect(elemento.querySelectorAll('.metodi button')).toHaveLength(2);
    expect(elemento.querySelector('.iban')?.textContent).toContain('IT60X0542811101000000123456');
  });

  it('pagare porta al provider, o spiega perché non si può', async () => {
    avvia.mockReturnValue(of({ url: '#provider' }));
    const { elemento, clicca } = await crea(riepilogo);

    await clicca('.metodi button');
    expect(avvia).toHaveBeenCalledWith('stripe');
    expect(window.location.hash).toBe('#provider');

    avvia.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'NULLA_DA_PAGARE', messaggio: 'Già pagata' } },
          }),
      ),
    );
    await clicca('.metodi button:last-child');
    expect(avvia).toHaveBeenLastCalledWith('paypal');
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Già pagata');
  });

  it('saldato dice che è tutto pagato; con saldo in struttura si nasconde', async () => {
    const pagato = await crea({ ...riepilogo, da_pagare_ora: 0, saldo: 0 });
    expect(pagato.elemento.querySelector('.esito-ok')).not.toBeNull();

    const inStruttura = await crea({ ...riepilogo, da_pagare_ora: 0, saldo: 210 });
    expect(inStruttura.elemento.hidden).toBe(true);
  });
});

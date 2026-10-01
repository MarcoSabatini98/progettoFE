import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { MetodoOnline } from '../../../shared/models/pagamento/pagamento-model';
import { RiepilogoPagamentoInterface } from '../../../shared/models/riepilogo-pagamento/riepilogo-pagamento-model';
import { LinkPagamentoComponent } from './link-pagamento-component';

describe('LinkPagamentoComponent', () => {
  const pagamenti = { avviaOnline: vi.fn() };

  beforeEach(() => {
    pagamenti.avviaOnline.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: PagamentiService, useValue: pagamenti }],
    });
  });

  async function crea(metodi: MetodoOnline[]) {
    const fixture = TestBed.createComponent(LinkPagamentoComponent);
    fixture.componentRef.setInput('prenotazioneId', 7);
    fixture.componentRef.setInput('riepilogo', {
      da_pagare_ora: 90,
      metodi_online: metodi,
    } as RiepilogoPagamentoInterface);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const apri = async () => {
      elemento.querySelector('button')?.click();
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, apri, invia };
  }

  it('senza metodi online non compare', async () => {
    const { elemento } = await crea([]);

    expect(elemento.hidden).toBe(true);
  });

  it('crea il link con il primo metodo e lo mostra da copiare', async () => {
    pagamenti.avviaOnline.mockReturnValue(of({ url: 'https://pagamento.test/abc' }));
    const { elemento, apri, invia } = await crea(['paypal', 'stripe']);

    await apri();
    const casella = elemento.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    casella.click();
    await invia();

    expect(pagamenti.avviaOnline).toHaveBeenCalledWith(7, {
      metodo: 'paypal',
      importo: undefined,
      invia_email: true,
    });
    expect(elemento.querySelector<HTMLInputElement>('input[type="url"]')?.value).toBe(
      'https://pagamento.test/abc',
    );
    expect(elemento.querySelector('[role="status"]')?.textContent).toContain(
      'gestionale.linkPagamento.inviato',
    );
  });

  it('se il provider non risponde lo dice', async () => {
    pagamenti.avviaOnline.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 502,
            error: { errore: { codice: 'PROVIDER_NON_DISPONIBILE', messaggio: 'Stripe giù' } },
          }),
      ),
    );
    const { elemento, apri, invia } = await crea(['stripe']);

    await apri();
    await invia();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Stripe giù');
  });
});

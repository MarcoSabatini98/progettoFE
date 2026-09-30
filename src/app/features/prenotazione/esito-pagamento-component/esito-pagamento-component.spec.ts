import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { EsitoPagamentoComponent } from './esito-pagamento-component';

describe('EsitoPagamentoComponent', () => {
  const pagamenti = { catturaPaypal: vi.fn() };

  beforeEach(() => {
    pagamenti.catturaPaypal.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PagamentiService, useValue: pagamenti },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(query: { esito?: string; token?: string }) {
    const fixture = TestBed.createComponent(EsitoPagamentoComponent);
    fixture.componentRef.setInput('codice', 'BB-123');
    Object.entries(query).forEach(([nome, valore]) => fixture.componentRef.setInput(nome, valore));
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    return {
      esito: () => elemento.querySelector('[data-esito]')?.getAttribute('data-esito'),
      testo: () => elemento.textContent,
      link: () => elemento.querySelector('a')?.getAttribute('href'),
    };
  }

  it('dopo Stripe conferma senza catturare nulla e riporta alla prenotazione', async () => {
    const { esito, link } = await crea({ esito: 'ok' });

    expect(pagamenti.catturaPaypal).not.toHaveBeenCalled();
    expect(esito()).toBe('ok');
    expect(link()).toBe('/prenotazioni/BB-123');
  });

  it("dopo PayPal cattura l'ordine prima di dare l'esito", async () => {
    pagamenti.catturaPaypal.mockReturnValue(of({ id: 1 }));
    const { esito } = await crea({ esito: 'ok', token: 'ORDINE-1' });

    expect(pagamenti.catturaPaypal).toHaveBeenCalledWith('ORDINE-1');
    expect(esito()).toBe('ok');
  });

  it('se la cattura fallisce ne spiega il motivo', async () => {
    pagamenti.catturaPaypal.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 402,
            error: { errore: { codice: 'PAGAMENTO_NON_RIUSCITO', messaggio: 'Carta rifiutata' } },
          }),
      ),
    );
    const { esito, testo } = await crea({ esito: 'ok', token: 'ORDINE-1' });

    expect(esito()).toBe('errore');
    expect(testo()).toContain('Carta rifiutata');
  });

  it('un pagamento annullato non cattura nulla', async () => {
    const { esito } = await crea({ esito: 'annullato', token: 'ORDINE-1' });

    expect(pagamenti.catturaPaypal).not.toHaveBeenCalled();
    expect(esito()).toBe('annullato');
  });
});

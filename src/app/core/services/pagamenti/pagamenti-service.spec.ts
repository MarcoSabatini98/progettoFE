import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { PagamentiService } from './pagamenti-service';

const API = `${environment.apiUrl}/pagamenti`;

describe('PagamentiService', () => {
  let service: PagamentiService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(PagamentiService);
  });

  afterEach(() => backend.verify());

  it("legge il riepilogo dall'area personale", () => {
    service.leggiRiepilogo(12, true).subscribe();

    backend.expectOne(`${API}/mie/12`).flush(risposta({}));
  });

  it('crea il link di pagamento dal gestionale', () => {
    const dati = { metodo: 'stripe' as const, invia_email: true };
    service.avviaOnline(12, dati).subscribe();

    const richiesta = backend.expectOne(`${API}/prenotazione/12/online`);
    expect(richiesta.request.method).toBe('POST');
    expect(richiesta.request.body).toEqual(dati);
    richiesta.flush(risposta({}));
  });

  it('gira a PayPal il token di ritorno', () => {
    service.catturaPaypal('ORDINE1').subscribe();

    const richiesta = backend.expectOne(`${API}/paypal/cattura`);
    expect(richiesta.request.body).toEqual({ token: 'ORDINE1' });
    richiesta.flush(risposta({}));
  });

  it('filtra per metodi', () => {
    service.elencaPagamenti({ metodo: ['stripe', 'paypal'], dal: '2026-10-01' }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.toString()).toBe('metodo=stripe,paypal&dal=2026-10-01');
    richiesta.flush(risposta({ elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 }));
  });
});

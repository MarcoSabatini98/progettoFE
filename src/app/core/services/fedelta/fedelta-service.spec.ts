import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { FedeltaService } from './fedelta-service';

const API = `${environment.apiUrl}/fedelta`;
const PAGINA_VUOTA = { elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 };

describe('FedeltaService', () => {
  let service: FedeltaService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(FedeltaService);
  });

  afterEach(() => backend.verify());

  it('legge la situazione del cliente collegato', () => {
    service.leggiSituazione().subscribe();

    backend.expectOne(`${API}/mia`).flush(risposta(null));
  });

  it('elenca i movimenti di un cliente dal gestionale', () => {
    service.elencaMovimenti({ pagina: 2 }, 9).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/clienti/9/movimenti`);
    expect(richiesta.request.params.get('pagina')).toBe('2');
    richiesta.flush(risposta(PAGINA_VUOTA));
  });

  it("legge le statistiche dell'anno in corso senza parametri", () => {
    service.leggiMieStatistiche().subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/mia/statistiche`);
    expect(richiesta.request.params.keys()).toEqual([]);
    richiesta.flush(risposta({ anno: 2026, punti_guadagnati: 0, punti_tolti: 0 }));
  });

  it('toglie punti a un cliente', () => {
    service.assegnaPunti(9, { punti: -50, motivo: 'rettifica' }).subscribe();

    const richiesta = backend.expectOne(`${API}/clienti/9/punti`);
    expect(richiesta.request.body).toEqual({ punti: -50, motivo: 'rettifica' });
    richiesta.flush(risposta({}));
  });
});

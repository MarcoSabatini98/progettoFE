import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { RecensioniService } from './recensioni-service';

const API = `${environment.apiUrl}/recensioni`;

describe('RecensioniService', () => {
  let service: RecensioniService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(RecensioniService);
  });

  afterEach(() => backend.verify());

  it('elenca le pubbliche in inglese', () => {
    service.elencaPubbliche({ lingua: 'en', pagina: 2 }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/pubbliche`);
    expect(richiesta.request.params.toString()).toBe('lingua=en&pagina=2');
    richiesta.flush(risposta({ elementi: [], totale: 0, pagina: 2, perPagina: 20, pagine: 0 }));
  });

  it('recensisce una prenotazione', () => {
    service.creaRecensione(12, { voto: 4 }).subscribe();

    const richiesta = backend.expectOne(`${API}/prenotazione/12`);
    expect(richiesta.request.body).toEqual({ voto: 4 });
    richiesta.flush(risposta({}));
  });

  it('pubblica una recensione', () => {
    service.moderaRecensione(3, 'pubblicata').subscribe();

    const richiesta = backend.expectOne(`${API}/3/moderazione`);
    expect(richiesta.request.method).toBe('PATCH');
    expect(richiesta.request.body).toEqual({ stato: 'pubblicata' });
    richiesta.flush(risposta({}));
  });

  it('toglie la risposta', () => {
    service.rispondi(3, null).subscribe();

    const richiesta = backend.expectOne(`${API}/3/risposta`);
    expect(richiesta.request.body).toEqual({ risposta: null });
    richiesta.flush(risposta({}));
  });
});

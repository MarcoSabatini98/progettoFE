import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { FattureService } from './fatture-service';

const API = `${environment.apiUrl}/fatture`;

describe('FattureService', () => {
  let service: FattureService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(FattureService);
  });

  afterEach(() => backend.verify());

  it("scarica l'XML dall'area personale", () => {
    service.scaricaFile(5, 'xml', true).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/mie/5/file`);
    expect(richiesta.request.params.get('tipo')).toBe('xml');
    expect(richiesta.request.responseType).toBe('blob');
    richiesta.flush(new Blob());
  });

  it('crea la bozza intestata a un altro cliente', () => {
    service.creaBozza(12, { denominazione: 'Rossi Srl' }).subscribe();

    const richiesta = backend.expectOne(`${API}/prenotazione/12`);
    expect(richiesta.request.body).toEqual({ cliente: { denominazione: 'Rossi Srl' } });
    richiesta.flush(risposta({}));
  });

  it("registra l'esito dello SDI", () => {
    service.aggiornaSdi(5, { stato_sdi: 'consegnata' }).subscribe();

    const richiesta = backend.expectOne(`${API}/5/sdi`);
    expect(richiesta.request.method).toBe('PATCH');
    richiesta.flush(risposta({}));
  });

  it('storna tutta la fattura', () => {
    service.creaNotaDiCredito(5).subscribe();

    const richiesta = backend.expectOne(`${API}/5/nota-di-credito`);
    expect(richiesta.request.body).toEqual({});
    richiesta.flush(risposta({}));
  });
});

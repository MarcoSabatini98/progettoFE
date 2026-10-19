import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { OspitiService } from './ospiti-service';

const API = `${environment.apiUrl}/ospiti`;

describe('OspitiService', () => {
  let service: OspitiService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(OspitiService);
  });

  afterEach(() => backend.verify());

  it('cerca le anagrafiche', () => {
    service.elencaOspiti({ cerca: 'rossi', pagina: 2 }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.toString()).toBe('cerca=rossi&pagina=2');
    richiesta.flush(risposta({ elementi: [], totale: 0, pagina: 2, perPagina: 20, pagine: 0 }));
  });

  it("imposta gli ospiti del soggiorno agganciando un'anagrafica esistente", () => {
    service
      .impostaOspitiPrenotazione(12, [
        { ospite: { id: 3 }, tipo_alloggiato: 'capofamiglia' },
        { ospite: { nome: 'Luca', cognome: 'Rossi' }, tipo_alloggiato: 'familiare' },
      ])
      .subscribe();

    const richiesta = backend.expectOne(`${API}/prenotazione/12`);
    expect(richiesta.request.method).toBe('PUT');
    expect(richiesta.request.body.ospiti).toHaveLength(2);
    richiesta.flush(risposta([]));
  });

  it("carica il documento sull'anagrafica", () => {
    const file = new File(['x'], 'passaporto.jpg', { type: 'image/jpeg' });
    service.caricaDocumento(3, file).subscribe();

    const richiesta = backend.expectOne(`${API}/3/documenti`);
    expect((richiesta.request.body as FormData).get('file')).toBe(file);
    richiesta.flush(risposta({}));
  });

  it('scarica il documento come blob', () => {
    service.scaricaDocumento(8).subscribe();

    const richiesta = backend.expectOne(`${API}/documenti/8`);
    expect(richiesta.request.responseType).toBe('blob');
    richiesta.flush(new Blob());
  });
});

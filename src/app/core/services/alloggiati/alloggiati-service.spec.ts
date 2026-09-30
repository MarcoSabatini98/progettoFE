import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { AlloggiatiService } from './alloggiati-service';

const API = `${environment.apiUrl}/alloggiati`;

describe('AlloggiatiService', () => {
  let service: AlloggiatiService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(AlloggiatiService);
  });

  afterEach(() => backend.verify());

  it('cerca comuni e stati per nome', () => {
    service.cercaLuoghi({ cerca: 'Rom', tipo: 'comune' }).subscribe((luoghi) => {
      expect(luoghi[0].codice).toBe('412058091');
    });

    const richiesta = backend.expectOne(`${API}/luoghi?cerca=Rom&tipo=comune`);
    richiesta.flush(risposta([{ codice: '412058091', descrizione: 'ROMA', provincia: 'RM' }]));
  });

  it('scarica il file di più prenotazioni come blob', () => {
    service.scaricaFile([8, 9]).subscribe();

    const richiesta = backend.expectOne(`${API}/file`);
    expect(richiesta.request.body).toEqual({ prenotazioni: [8, 9] });
    expect(richiesta.request.responseType).toBe('blob');
    richiesta.flush(new Blob(['riga']));
  });

  it("registra l'esito dell'invio", () => {
    service.registraInvio(8, { esito: 'inviata' }).subscribe();

    const richiesta = backend.expectOne(`${API}/prenotazione/8/invio`);
    expect(richiesta.request.body).toEqual({ esito: 'inviata' });
    richiesta.flush(risposta({ prenotazione: {}, completa: true, ospiti: [] }));
  });
});

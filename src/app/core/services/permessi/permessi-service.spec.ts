import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { PermessiService } from './permessi-service';

const API = `${environment.apiUrl}/permessi`;

describe('PermessiService', () => {
  let service: PermessiService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(PermessiService);
  });

  afterEach(() => backend.verify());

  it('sostituisce i permessi di un ruolo', () => {
    let salvati: unknown;
    service.impostaPermessi('housekeeper', ['pulizie.leggi']).subscribe((dati) => (salvati = dati));

    const richiesta = backend.expectOne(`${API}/housekeeper`);
    expect(richiesta.request.method).toBe('PUT');
    expect(richiesta.request.body).toEqual({ permessi: ['pulizie.leggi'] });
    richiesta.flush(risposta(['pulizie.leggi']));
    expect(salvati).toEqual(['pulizie.leggi']);
  });

  it('manda le regole della chat come coppie di ruoli', () => {
    service.impostaRegoleChat([['receptionist', 'housekeeper']]).subscribe();

    const richiesta = backend.expectOne(`${API}/chat`);
    expect(richiesta.request.body).toEqual({ coppie: [['receptionist', 'housekeeper']] });
    richiesta.flush(risposta([]));
  });
});

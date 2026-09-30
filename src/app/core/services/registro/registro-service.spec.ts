import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { RegistroService } from './registro-service';

const API = `${environment.apiUrl}/registro`;
const PAGINA_VUOTA = { elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 };

describe('RegistroService', () => {
  let service: RegistroService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(RegistroService);
  });

  afterEach(() => backend.verify());

  it('filtra il registro per azione', () => {
    service.elencaAttivita({ azione: 'eliminazione' }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.get('azione')).toBe('eliminazione');
    richiesta.flush(risposta(PAGINA_VUOTA));
  });

  it('legge la storia di una prenotazione', () => {
    service.leggiStoria('prenotazioni', 42).subscribe();

    backend.expectOne((req) => req.url === `${API}/prenotazioni/42`).flush(risposta(PAGINA_VUOTA));
  });
});

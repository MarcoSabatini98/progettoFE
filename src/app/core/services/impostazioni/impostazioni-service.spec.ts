import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { ImpostazioniService } from './impostazioni-service';

const API = `${environment.apiUrl}/impostazioni`;

describe('ImpostazioniService', () => {
  let service: ImpostazioniService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(ImpostazioniService);
  });

  afterEach(() => backend.verify());

  it('legge le impostazioni pubbliche come mappa', () => {
    let nome: unknown;
    service.leggiPubbliche().subscribe((impostazioni) => (nome = impostazioni['nome_struttura']));

    backend.expectOne(`${API}/pubbliche`).flush(risposta({ nome_struttura: 'Villa Mare' }));

    expect(nome).toBe('Villa Mare');
  });

  it('aggiorna più impostazioni in una sola richiesta', () => {
    service.aggiornaImpostazioni({ ora_checkin: 15, prenotazioni_attive: true }).subscribe();

    const richiesta = backend.expectOne(API);
    expect(richiesta.request.method).toBe('PATCH');
    expect(richiesta.request.body).toEqual({ ora_checkin: 15, prenotazioni_attive: true });
    richiesta.flush(risposta([]));
  });
});

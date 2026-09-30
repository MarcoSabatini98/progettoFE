import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { CalendariService } from './calendari-service';

const API = `${environment.apiUrl}/calendari`;

describe('CalendariService', () => {
  let service: CalendariService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(CalendariService);
  });

  afterEach(() => backend.verify());

  it('filtra le chiusure per periodo', () => {
    service.elencaChiusure({ dal: '2026-11-01', al: '2026-11-30' }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/chiusure`);
    expect(richiesta.request.params.get('dal')).toBe('2026-11-01');
    richiesta.flush(risposta([]));
  });

  it('chiude tutta la struttura senza camera', () => {
    service.blocca({ data_inizio: '2026-11-10', data_fine: '2026-11-30' }).subscribe();

    const richiesta = backend.expectOne(`${API}/chiusure`);
    expect(richiesta.request.body).toEqual({ data_inizio: '2026-11-10', data_fine: '2026-11-30' });
    richiesta.flush(risposta({ chiusura: {}, prenotazioni_in_conflitto: [] }));
  });

  it('restituisce quanti eventi ha letto la sincronizzazione', () => {
    let eventi: number | undefined;
    service.sincronizza(2).subscribe((letti) => (eventi = letti));

    backend.expectOne(`${API}/esterni/2/sincronizzazione`).flush(risposta({ eventi: 5 }));

    expect(eventi).toBe(5);
  });
});

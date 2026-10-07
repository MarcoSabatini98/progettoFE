import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { DisponibilitaService } from './disponibilita-service';

const API = `${environment.apiUrl}/disponibilita`;

describe('DisponibilitaService', () => {
  let service: DisponibilitaService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(DisponibilitaService);
  });

  afterEach(() => backend.verify());

  it('ripete le età dei bambini nella query', () => {
    service
      .cerca({ arrivo: '2026-10-01', partenza: '2026-10-03', adulti: 2, eta_bambini: [3, 5] })
      .subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.toString()).toBe(
      'arrivo=2026-10-01&partenza=2026-10-03&adulti=2&eta_bambini=3&eta_bambini=5',
    );
    richiesta.flush(risposta([]));
  });

  it('legge le notti occupate di una camera nel periodo', () => {
    let occupate: string[] = [];
    service.leggiOccupazione({ camera_id: 4 }, '2026-10-01', '2026-12-01').subscribe((notti) => {
      occupate = notti;
    });

    const richiesta = backend.expectOne((req) => req.url === `${API}/occupazione`);
    expect(richiesta.request.params.toString()).toBe('camera_id=4&dal=2026-10-01&al=2026-12-01');
    richiesta.flush(risposta({ occupate: ['2026-10-09'] }));

    expect(occupate).toEqual(['2026-10-09']);
  });

  it('blocca una camera della tipologia', () => {
    const dati = { tipologia_id: 1, arrivo: '2026-10-01', partenza: '2026-10-03', ospiti: 2 };
    service.blocca(dati).subscribe();

    const richiesta = backend.expectOne(`${API}/blocchi`);
    expect(richiesta.request.method).toBe('POST');
    expect(richiesta.request.body).toEqual(dati);
    richiesta.flush(risposta({ sessione: 'abc', camera_id: 4, scade_il: '' }));
  });

  it('rilascia il blocco della sessione', () => {
    service.rilascia('abc').subscribe();

    const richiesta = backend.expectOne(`${API}/blocchi/abc`);
    expect(richiesta.request.method).toBe('DELETE');
    richiesta.flush(risposta(null));
  });
});

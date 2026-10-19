import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { AnalyticsService } from './analytics-service';

const API = `${environment.apiUrl}/analytics`;

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(AnalyticsService);
  });

  afterEach(() => backend.verify());

  it('legge i ricavi del periodo indicato', () => {
    service.leggiRicavi({ dal: '2026-10-01', al: '2026-11-01' }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/ricavi`);
    expect(richiesta.request.params.get('al')).toBe('2026-11-01');
    richiesta.flush(risposta({}));
  });

  it('chiede i suggerimenti di una tipologia', () => {
    service.elencaSuggerimentiPrezzo({ tipologia_id: 2 }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/suggerimenti-prezzo`);
    expect(richiesta.request.params.get('tipologia_id')).toBe('2');
    richiesta.flush(risposta([]));
  });

  it("scarica il report dell'ultimo mese come blob", () => {
    service.scaricaReport().subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/report`);
    expect(richiesta.request.params.keys()).toEqual([]);
    expect(richiesta.request.responseType).toBe('blob');
    richiesta.flush(new Blob(['%PDF']));
  });

  it("elenca gli incassi dell'anno indicato", () => {
    service.elencaIncassi(2025).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/incassi`);
    expect(richiesta.request.params.get('anno')).toBe('2025');
    richiesta.flush(risposta([]));
  });
});

import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { CamereService } from './camere-service';

const API = `${environment.apiUrl}/camere`;

describe('CamereService', () => {
  let service: CamereService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(CamereService);
  });

  afterEach(() => backend.verify());

  it('legge la tipologia pubblica dallo slug', () => {
    service.leggiTipologiaPubblica('doppia-vista-mare').subscribe();

    backend.expectOne(`${API}/sito/tipologie/doppia-vista-mare`).flush(risposta({}));
  });

  it('chiede il planning del periodo', () => {
    service.leggiPlanning({ dal: '2026-10-01', al: '2026-10-15' }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/planning`);
    expect(richiesta.request.params.toString()).toBe('dal=2026-10-01&al=2026-10-15');
    richiesta.flush(risposta([]));
  });

  it('filtra le camere per stato di pulizia', () => {
    service.elencaCamere({ stato_pulizia: 'sporca' }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.get('stato_pulizia')).toBe('sporca');
    richiesta.flush(risposta([]));
  });

  it('crea la camera con le dotazioni', () => {
    service.creaCamera({ numero: '101', tipologia_id: 2, servizi: [1, 4] }).subscribe();

    const richiesta = backend.expectOne(API);
    expect(richiesta.request.method).toBe('POST');
    expect(richiesta.request.body).toEqual({ numero: '101', tipologia_id: 2, servizi: [1, 4] });
    richiesta.flush(risposta({}));
  });

  it('rigenera il link iCal', () => {
    service.rigeneraTokenIcal(5).subscribe();

    const richiesta = backend.expectOne(`${API}/5/token-ical`);
    expect(richiesta.request.method).toBe('POST');
    richiesta.flush(risposta({}));
  });
});

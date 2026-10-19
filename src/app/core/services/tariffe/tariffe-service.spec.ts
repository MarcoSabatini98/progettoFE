import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { TariffeService } from './tariffe-service';

const API = `${environment.apiUrl}/tariffe`;

describe('TariffeService', () => {
  let service: TariffeService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(TariffeService);
  });

  afterEach(() => backend.verify());

  it('chiede il preventivo con gli extra scelti', () => {
    const dati = {
      tipologia_id: 1,
      arrivo: '2026-10-01',
      partenza: '2026-10-04',
      adulti: 2,
      servizi: [{ servizio_id: 3, quantita: 2 }],
    };
    service.calcolaPreventivo(dati).subscribe();

    const richiesta = backend.expectOne(`${API}/preventivo`);
    expect(richiesta.request.method).toBe('POST');
    expect(richiesta.request.body).toEqual(dati);
    richiesta.flush(risposta({}));
  });

  it('verifica un codice sconto', () => {
    let verificato: unknown;
    service.verificaCodiceSconto('ESTATE10').subscribe((dati) => (verificato = dati));

    const richiesta = backend.expectOne(`${API}/codici-sconto/verifica`);
    expect(richiesta.request.body).toEqual({ codice: 'ESTATE10' });
    richiesta.flush(risposta({ codice: 'ESTATE10', tipo_sconto: 'percentuale', valore: 10 }));
    expect(verificato).toMatchObject({ codice: 'ESTATE10' });
  });

  it('legge piani e tassa per il sito', () => {
    let condizioni: unknown;
    service.leggiCondizioniSoggiorno().subscribe((dati) => (condizioni = dati));

    const richiesta = backend.expectOne(`${API}/soggiorno`);
    expect(richiesta.request.method).toBe('GET');
    richiesta.flush(risposta({ piani: [], tassa: null }));
    expect(condizioni).toEqual({ piani: [], tassa: null });
  });

  it('filtra i periodi per date', () => {
    service.elencaPeriodi({ dal: '2026-06-01', attivo: true }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/periodi`);
    expect(richiesta.request.params.toString()).toBe('dal=2026-06-01&attivo=true');
    richiesta.flush(risposta([]));
  });

  it('aggiorna il piano', () => {
    service.aggiornaPiano(2, { predefinito: true }).subscribe();

    const richiesta = backend.expectOne(`${API}/piani/2`);
    expect(richiesta.request.method).toBe('PATCH');
    richiesta.flush(risposta({}));
  });
});

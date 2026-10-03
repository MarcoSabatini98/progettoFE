import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { PulizieService } from './pulizie-service';

const API = `${environment.apiUrl}/pulizie`;

describe('PulizieService', () => {
  let service: PulizieService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(PulizieService);
  });

  afterEach(() => backend.verify());

  it('elenca solo le mie attività di un giorno', () => {
    service.elencaAttivita({ data: '2026-10-03', mie: true }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.toString()).toBe('data=2026-10-03&mie=true');
    richiesta.flush(risposta([]));
  });

  it('elenca gli addetti a cui assegnare', () => {
    service.elencaAddetti().subscribe();

    const richiesta = backend.expectOne(`${API}/addetti`);
    expect(richiesta.request.method).toBe('GET');
    richiesta.flush(risposta([]));
  });

  it('genera la giornata di oggi', () => {
    service.generaGiornata().subscribe();

    const richiesta = backend.expectOne(`${API}/giornata`);
    expect(richiesta.request.method).toBe('POST');
    richiesta.flush(risposta({ riassetti: 4, checklist_aggiunte: 0 }));
  });

  it('completa un attività con la checklist', () => {
    const dati = { stato: 'completata' as const, checklist: [{ voce: 'Bagno', fatto: true }] };
    service.avanzaAttivita(9, dati).subscribe();

    const richiesta = backend.expectOne(`${API}/9/avanzamento`);
    expect(richiesta.request.body).toEqual(dati);
    richiesta.flush(risposta({}));
  });

  it('disattiva una voce della checklist', () => {
    service.aggiornaVoce(2, { attiva: false }).subscribe();

    const richiesta = backend.expectOne(`${API}/checklist/2`);
    expect(richiesta.request.method).toBe('PATCH');
    richiesta.flush(risposta({}));
  });
});

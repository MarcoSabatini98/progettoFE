import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { PrenotazioniService } from './prenotazioni-service';

const API = `${environment.apiUrl}/prenotazioni`;

describe('PrenotazioniService', () => {
  let service: PrenotazioniService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(PrenotazioniService);
  });

  afterEach(() => backend.verify());

  it('filtra per più stati', () => {
    service.elencaPrenotazioni({ stato: ['confermata', 'in_soggiorno'], pagina: 2 }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.toString()).toBe('stato=confermata,in_soggiorno&pagina=2');
    richiesta.flush(risposta({ elementi: [], totale: 0, pagina: 2, perPagina: 20, pagine: 0 }));
  });

  it('cancella dall area personale', () => {
    service.cancellaPrenotazione(12, { motivo: 'Imprevisto' }, true).subscribe();

    const richiesta = backend.expectOne(`${API}/mie/12/cancellazione`);
    expect(richiesta.request.method).toBe('POST');
    expect(richiesta.request.body).toEqual({ motivo: 'Imprevisto' });
    richiesta.flush(risposta({}));
  });

  it('rimuove un extra dal gestionale', () => {
    service.rimuoviServizio(12, 3).subscribe();

    const richiesta = backend.expectOne(`${API}/12/servizi/3`);
    expect(richiesta.request.method).toBe('DELETE');
    richiesta.flush(risposta({}));
  });

  it('forza il check-out', () => {
    service.checkOut(12, true).subscribe();

    const richiesta = backend.expectOne(`${API}/12/check-out`);
    expect(richiesta.request.body).toEqual({ forza: true });
    richiesta.flush(risposta({}));
  });

  it('manda i dati del check-in online col token', () => {
    const dati = { ospiti: [{ ospite: { nome: 'Anna', cognome: 'Rossi' } }] };
    service.inviaCheckinOnline('abc', dati).subscribe();

    const richiesta = backend.expectOne(`${API}/checkin-online/abc`);
    expect(richiesta.request.method).toBe('PUT');
    expect(richiesta.request.body).toEqual(dati);
    richiesta.flush(risposta({}));
  });
});

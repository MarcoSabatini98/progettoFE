import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { NotificheService } from './notifiche-service';

const API = `${environment.apiUrl}/notifiche`;

describe('NotificheService', () => {
  let service: NotificheService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(NotificheService);
  });

  afterEach(() => backend.verify());

  it('elenca solo le non lette', () => {
    service.elencaNotifiche({ non_lette: true }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.get('non_lette')).toBe('true');
    richiesta.flush(
      risposta({ elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0, non_lette: 0 }),
    );
  });

  it('restituisce il contatore come numero', () => {
    let totale: number | undefined;
    service.contaNonLette().subscribe((valore) => (totale = valore));

    backend.expectOne(`${API}/non-lette`).flush(risposta({ non_lette: 3 }));
    expect(totale).toBe(3);
  });

  it('segna tutte lette e restituisce quante', () => {
    let aggiornate: number | undefined;
    service.segnaTutteLette().subscribe((valore) => (aggiornate = valore));

    backend.expectOne(`${API}/lette`).flush(risposta({ aggiornate: 5 }));
    expect(aggiornate).toBe(5);
  });
});

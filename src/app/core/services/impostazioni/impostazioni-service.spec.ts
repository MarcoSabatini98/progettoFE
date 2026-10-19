import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { CHIAVI_IMPOSTAZIONI } from './impostazioni-costanti';
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
    service.leggiPubbliche().subscribe((impostazioni) => (nome = impostazioni['struttura_nome']));

    backend.expectOne(`${API}/pubbliche`).flush(risposta({ struttura_nome: 'Villa Mare' }));

    expect(nome).toBe('Villa Mare');
  });

  it('conserva le pubbliche nel segnale e le legge come testo', () => {
    // Prima della risposta il testo è vuoto, mai "undefined".
    expect(service.testo('struttura_nome')).toBe('');

    service.leggiPubbliche().subscribe();
    backend
      .expectOne(`${API}/pubbliche`)
      .flush(risposta({ struttura_nome: 'Villa Mare', fedelta_punti_per_notte: 10 }));

    expect(service.pubbliche()['struttura_nome']).toBe('Villa Mare');
    expect(service.testo('fedelta_punti_per_notte')).toBe('10');
  });

  it('compone l’indirizzo saltando le parti mancanti', () => {
    service.leggiPubbliche().subscribe();
    backend.expectOne(`${API}/pubbliche`).flush(
      risposta({
        [CHIAVI_IMPOSTAZIONI.indirizzo]: 'Via Roma 1',
        [CHIAVI_IMPOSTAZIONI.cap]: '07100',
        [CHIAVI_IMPOSTAZIONI.comune]: 'Sassari',
        [CHIAVI_IMPOSTAZIONI.provincia]: 'SS',
      }),
    );
    expect(service.indirizzo()).toBe('Via Roma 1, 07100 Sassari (SS)');

    service.leggiPubbliche().subscribe();
    backend
      .expectOne(`${API}/pubbliche`)
      .flush(risposta({ [CHIAVI_IMPOSTAZIONI.comune]: 'Sassari' }));
    expect(service.indirizzo()).toBe('Sassari');
  });

  it('aggiorna più impostazioni in una sola richiesta', () => {
    service.aggiornaImpostazioni({ ora_checkin: 15, prenotazioni_attive: true }).subscribe();

    const richiesta = backend.expectOne(API);
    expect(richiesta.request.method).toBe('PATCH');
    expect(richiesta.request.body).toEqual({ ora_checkin: 15, prenotazioni_attive: true });
    richiesta.flush(risposta([]));
  });
});

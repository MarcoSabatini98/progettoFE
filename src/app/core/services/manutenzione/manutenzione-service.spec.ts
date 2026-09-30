import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { ManutenzioneService } from './manutenzione-service';

const API = `${environment.apiUrl}/manutenzione`;

describe('ManutenzioneService', () => {
  let service: ManutenzioneService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(ManutenzioneService);
  });

  afterEach(() => backend.verify());

  it('elenca le segnalazioni aperte di una camera', () => {
    service.elencaSegnalazioni({ aperte: true, camera_id: 4 }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.toString()).toBe('aperte=true&camera_id=4');
    richiesta.flush(risposta({ elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 }));
  });

  it('segnala un guasto in area comune', () => {
    service.segnala({ titolo: 'Ascensore bloccato', camera_id: null }).subscribe();

    const richiesta = backend.expectOne(API);
    expect(richiesta.request.method).toBe('POST');
    richiesta.flush(risposta({}));
  });

  it('chiude la segnalazione con le note', () => {
    const dati = { stato: 'risolta' as const, note_risoluzione: 'Sostituito il sifone' };
    service.aggiornaSegnalazione(3, dati).subscribe();

    const richiesta = backend.expectOne(`${API}/3`);
    expect(richiesta.request.body).toEqual(dati);
    richiesta.flush(risposta({}));
  });
});

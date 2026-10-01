import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { erroriFileInterceptor } from './errori-file-interceptor';

describe('erroriFileInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([erroriFileInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  async function errore(corpo: Blob) {
    const risposta = firstValueFrom(http.get('/file', { responseType: 'blob' }));
    backend.expectOne('/file').flush(corpo, { status: 422, statusText: 'Unprocessable' });
    return risposta.catch((e: HttpErrorResponse) => e);
  }

  it("rilegge come oggetto l'errore JSON arrivato in un Blob", async () => {
    const dettaglio = { errore: { codice: 'DATI_ALLOGGIATI_INCOMPLETI', messaggio: 'Mancano' } };
    const testo = JSON.stringify(dettaglio);
    // jsdom non ha Blob.text(), che i browser hanno: lo si aggiunge al file del test.
    const blob = Object.assign(new Blob([testo], { type: 'application/json' }), {
      text: async () => testo,
    });

    const ricevuto = (await errore(blob)) as HttpErrorResponse;

    expect(ricevuto.status).toBe(422);
    expect(ricevuto.error).toEqual(dettaglio);
  });

  it('lascia invariato un errore che non è JSON', async () => {
    const blob = new Blob(['rotto'], { type: 'text/plain' });

    const ricevuto = (await errore(blob)) as HttpErrorResponse;

    expect(ricevuto.error).toBe(blob);
  });
});

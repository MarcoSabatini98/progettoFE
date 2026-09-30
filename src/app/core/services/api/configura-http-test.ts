import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';

/** Solo per i test dei service: HttpClient finto, da cui leggere le richieste partite. */
export function configuraHttpTest(): HttpTestingController {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return TestBed.inject(HttpTestingController);
}

/** Risposta di successo dell'API attorno ai dati. */
export function risposta<T>(dati: T): RispostaApiInterface<T> {
  return { successo: true, dati };
}

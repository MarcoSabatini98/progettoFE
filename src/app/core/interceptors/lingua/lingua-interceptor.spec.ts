import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { LinguaService } from '../../services/lingua/lingua-service';
import { linguaInterceptor } from './lingua-interceptor';

describe('linguaInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([linguaInterceptor])),
        provideHttpClientTesting(),
        { provide: LinguaService, useValue: { attiva: signal('en') } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it("aggiunge la lingua attiva alle chiamate verso l'API", () => {
    http.get(`${environment.apiUrl}/camere`).subscribe();
    const richiesta = backend.expectOne((r) => r.url === `${environment.apiUrl}/camere`);
    expect(richiesta.request.params.get('lingua')).toBe('en');
    richiesta.flush([]);
  });

  it('non tocca le altre chiamate', () => {
    http.get('i18n/en.json').subscribe();
    const richiesta = backend.expectOne('i18n/en.json');
    expect(richiesta.request.params.has('lingua')).toBe(false);
    richiesta.flush({});
  });
});

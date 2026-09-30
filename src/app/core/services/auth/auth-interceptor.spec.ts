import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { SessioneInterface } from '../../../shared/models/sessione/sessione-model';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from './auth-service';

const API = environment.apiUrl;

const sessione = (accessToken: string): SessioneInterface => ({
  accessToken,
  utente: {
    id: 1,
    uuid: 'u-1',
    email: 'admin@example.com',
    nome: 'Anna',
    cognome: 'Rossi',
    ruolo: 'admin',
    lingua: 'it',
    colore_avatar: null,
    email_verificata: true,
    permessi: [],
  },
});

const NON_AUTORIZZATO = { status: 401, statusText: 'Unauthorized' };
const erroreApi = (codice: string) => ({ successo: false, errore: { codice, messaggio: codice } });

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  const accedi = (token: string) => {
    TestBed.inject(AuthService).accedi({ email: 'a', password: 'b' }).subscribe();
    backend.expectOne(`${API}/auth/accesso`).flush({ successo: true, dati: sessione(token) });
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it("aggiunge il Bearer token alle chiamate verso l'API", () => {
    accedi('vecchio');
    http.get(`${API}/camere`).subscribe();

    const richiesta = backend.expectOne(`${API}/camere`);
    expect(richiesta.request.headers.get('Authorization')).toBe('Bearer vecchio');
    expect(richiesta.request.withCredentials).toBe(false);
    richiesta.flush({});
  });

  it('manda il cookie solo alle chiamate di /auth', () => {
    const accesso = TestBed.inject(AuthService).accedi({ email: 'a', password: 'b' });
    accesso.subscribe();

    const richiesta = backend.expectOne(`${API}/auth/accesso`);
    expect(richiesta.request.withCredentials).toBe(true);
    expect(richiesta.request.headers.has('Authorization')).toBe(false);
    richiesta.flush({ successo: true, dati: sessione('x') });
  });

  it('non tocca le chiamate fuori dalla API', () => {
    accedi('vecchio');
    http.get('i18n/it.json').subscribe();

    const richiesta = backend.expectOne('i18n/it.json');
    expect(richiesta.request.headers.has('Authorization')).toBe(false);
    richiesta.flush({});
  });

  it('su 401 rinnova il token e ripete la richiesta', () => {
    accedi('vecchio');
    let risposta: unknown;
    http.get(`${API}/camere`).subscribe((dati) => (risposta = dati));

    backend.expectOne(`${API}/camere`).flush(erroreApi('TOKEN_SCADUTO'), NON_AUTORIZZATO);
    backend.expectOne(`${API}/auth/rinnovo`).flush({ successo: true, dati: sessione('nuovo') });
    const ripetuta = backend.expectOne(`${API}/camere`);
    expect(ripetuta.request.headers.get('Authorization')).toBe('Bearer nuovo');
    ripetuta.flush(['ok']);

    expect(risposta).toEqual(['ok']);
  });

  it('se il rinnovo fallisce restituisce il 401 originale e chiude la sessione', () => {
    accedi('vecchio');
    let stato = 0;
    http.get(`${API}/camere`).subscribe({ error: (errore) => (stato = errore.status) });

    backend.expectOne(`${API}/camere`).flush(erroreApi('TOKEN_SCADUTO'), NON_AUTORIZZATO);
    backend.expectOne(`${API}/auth/rinnovo`).flush(null, NON_AUTORIZZATO);

    expect(stato).toBe(401);
    expect(TestBed.inject(AuthService).collegato()).toBe(false);
  });

  it('un 401 che non riguarda il token passa senza rinnovo', () => {
    accedi('valido');
    let codice = '';
    http.delete(`${API}/auth/account`).subscribe({
      error: (errore) => (codice = errore.error.errore.codice),
    });

    backend.expectOne(`${API}/auth/account`).flush(erroreApi('PASSWORD_ERRATA'), NON_AUTORIZZATO);
    backend.expectNone(`${API}/auth/rinnovo`);
    expect(codice).toBe('PASSWORD_ERRATA');
  });

  it('senza sessione un 401 passa senza rinnovo', () => {
    let stato = 0;
    http.get(`${API}/prenotazioni/mie`).subscribe({ error: (errore) => (stato = errore.status) });

    backend.expectOne(`${API}/prenotazioni/mie`).flush(erroreApi('TOKEN_SCADUTO'), NON_AUTORIZZATO);
    backend.expectNone(`${API}/auth/rinnovo`);
    expect(stato).toBe(401);
  });
});

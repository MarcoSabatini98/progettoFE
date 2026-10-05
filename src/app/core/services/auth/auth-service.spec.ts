import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { SessioneInterface } from '../../../shared/models/sessione/sessione-model';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { AuthService } from './auth-service';

const API = `${environment.apiUrl}/auth`;

const SESSIONE: SessioneInterface = {
  accessToken: 'token-1',
  utente: {
    id: 3,
    uuid: 'u-3',
    email: 'reception@example.com',
    nome: 'Luca',
    cognome: 'Bianchi',
    ruolo: 'receptionist',
    lingua: 'it',
    colore_avatar: null,
    email_verificata: false,
    permessi: ['prenotazioni.leggi', 'checkin.gestisci'],
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let backend: HttpTestingController;

  const avvia = () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    backend = TestBed.inject(HttpTestingController);
  };

  const accedi = () => {
    service.accedi({ email: 'reception@example.com', password: 'segreta123' }).subscribe();
    backend.expectOne(`${API}/accesso`).flush({ successo: true, dati: SESSIONE });
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => backend.verify());

  it("all'accesso salva la sessione in memoria e solo un segnale sul dispositivo", () => {
    avvia();
    accedi();

    expect(service.collegato()).toBe(true);
    expect(service.token()).toBe('token-1');
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.sessione)).toBe('1');
    expect(JSON.stringify(localStorage)).not.toContain('token-1');
  });

  it('controlla ruoli e permessi', () => {
    avvia();
    accedi();

    expect(service.haRuolo(['admin', 'receptionist'])).toBe(true);
    expect(service.haRuolo(['admin'])).toBe(false);
    expect(service.haPermessi(['prenotazioni.leggi'])).toBe(true);
    expect(service.haPermessi(['prenotazioni.leggi', 'tariffe.gestisci'])).toBe(false);
  });

  it('puoAccedere: basta uno dei ruoli ma servono tutti i permessi', () => {
    avvia();
    accedi();

    expect(service.puoAccedere({})).toBe(true);
    expect(service.puoAccedere({ ruoli: ['admin', 'receptionist'] })).toBe(true);
    expect(service.puoAccedere({ ruoli: ['receptionist'], permessi: ['tariffe.gestisci'] })).toBe(
      false,
    );
  });

  it('le richieste di rinnovo contemporanee ne fanno partire una sola', () => {
    avvia();
    service.rinnova().subscribe();
    service.rinnova().subscribe();

    backend.expectOne(`${API}/rinnovo`).flush({ successo: true, dati: SESSIONE });
    expect(service.utente()?.id).toBe(3);
  });

  it('senza segnale di sessione non prova a ripristinarla', () => {
    avvia();
    let esito: unknown = 'in attesa';
    service.ripristina().subscribe((utente) => (esito = utente));

    backend.expectNone(`${API}/rinnovo`);
    expect(esito).toBeNull();
  });

  it('un ripristino fallito chiude la sessione senza errori', () => {
    localStorage.setItem(CHIAVI_ARCHIVIO.sessione, '1');
    avvia();
    let esito: unknown = 'in attesa';
    service.ripristina().subscribe((utente) => (esito = utente));

    backend
      .expectOne(`${API}/rinnovo`)
      .flush({ successo: false }, { status: 401, statusText: 'Unauthorized' });
    expect(esito).toBeNull();
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.sessione)).toBeNull();
  });

  it("all'uscita chiude la sessione anche se la chiamata fallisce", () => {
    avvia();
    accedi();
    service.esci().subscribe({ error: () => undefined });

    backend.expectOne(`${API}/uscita`).flush(null, { status: 500, statusText: 'Errore' });
    expect(service.collegato()).toBe(false);
  });

  it("la verifica dell'email aggiorna l'utente in sessione", () => {
    avvia();
    accedi();
    service.verificaEmail('123456').subscribe();

    const richiesta = backend.expectOne(`${API}/verifica-email`);
    expect(richiesta.request.body).toEqual({ codice: '123456' });
    richiesta.flush({ successo: true, dati: null });
    expect(service.utente()?.email_verificata).toBe(true);
  });

  it('la disiscrizione manda il token del link', () => {
    avvia();
    service.disiscrivi('uuid.firma').subscribe();

    const richiesta = backend.expectOne(`${API}/disiscrizione`);
    expect(richiesta.request.body).toEqual({ token: 'uuid.firma' });
    richiesta.flush({ successo: true, dati: null });
  });

  it('dopo il cambio password bisogna rientrare', () => {
    avvia();
    accedi();
    service.cambiaPassword({ password_attuale: 'a', nuova_password: 'b' }).subscribe();

    backend.expectOne(`${API}/password`).flush({ successo: true, dati: null });
    expect(service.collegato()).toBe(false);
  });

  it("l'eliminazione dell'account manda la password nel corpo", () => {
    avvia();
    accedi();
    service.eliminaAccount('segreta123').subscribe();

    const richiesta = backend.expectOne(`${API}/account`);
    expect(richiesta.request.method).toBe('DELETE');
    expect(richiesta.request.body).toEqual({ password: 'segreta123' });
    richiesta.flush({ successo: true, dati: null });
    expect(service.collegato()).toBe(false);
  });

  it('senza account usa il token della chat salvato sul dispositivo', () => {
    localStorage.setItem(CHIAVI_ARCHIVIO.tokenChat, 'chat-1');
    avvia();
    expect(service.token()).toBe('chat-1');

    service.impostaTokenChat('chat-2');
    expect(service.token()).toBe('chat-2');
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.tokenChat)).toBe('chat-2');
  });
});

import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { AuthService } from '../auth/auth-service';
import { UtentiService } from './utenti-service';

const API = `${environment.apiUrl}/utenti`;

describe('UtentiService', () => {
  let service: UtentiService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(UtentiService);
  });

  afterEach(() => backend.verify());

  it("manda i filtri dell'elenco come query string", () => {
    service.elencaUtenti({ ruolo: 'housekeeper', attivo: true }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === API);
    expect(richiesta.request.params.toString()).toBe('ruolo=housekeeper&attivo=true');
    richiesta.flush(risposta({ elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 }));
  });

  it('il profilo aggiornato passa nome e lingua alla sessione', () => {
    const auth = TestBed.inject(AuthService);
    const modifiche: unknown[] = [];
    auth.aggiornaUtente = (dati) => modifiche.push(dati);
    service.aggiornaProfilo({ nome: 'Giulia' }).subscribe();

    const richiesta = backend.expectOne(`${API}/profilo`);
    expect(richiesta.request.method).toBe('PATCH');
    richiesta.flush(risposta({ nome: 'Giulia', cognome: 'Rossi', lingua: 'en' }));
    expect(modifiche).toEqual([{ nome: 'Giulia', cognome: 'Rossi', lingua: 'en' }]);
  });

  it('le preferenze email mandano solo la voce cambiata', () => {
    service.aggiornaPreferenzeEmail({ email_marketing: true }).subscribe();

    const richiesta = backend.expectOne(`${API}/profilo/preferenze-email`);
    expect(richiesta.request.method).toBe('PATCH');
    expect(richiesta.request.body).toEqual({ email_marketing: true });
    richiesta.flush(risposta({ notifiche_email: true, email_marketing: true }));
  });

  it('carica il documento come file', () => {
    const file = new File(['x'], 'carta.pdf', { type: 'application/pdf' });
    service.caricaDocumento(file).subscribe();

    const richiesta = backend.expectOne(`${API}/profilo/documenti`);
    expect((richiesta.request.body as FormData).get('file')).toBe(file);
    richiesta.flush(risposta({}));
  });

  it('scarica il documento come blob', () => {
    service.scaricaDocumento(4).subscribe();

    const richiesta = backend.expectOne(`${API}/profilo/documenti/4`);
    expect(richiesta.request.responseType).toBe('blob');
    richiesta.flush(new Blob());
  });

  it("restituisce i dati senza l'involucro dell'API", () => {
    let eliminato: unknown = 'in attesa';
    service.eliminaUtente(9).subscribe((dati) => (eliminato = dati));

    const richiesta = backend.expectOne(`${API}/9`);
    expect(richiesta.request.method).toBe('DELETE');
    richiesta.flush(risposta(null));
    expect(eliminato).toBeNull();
  });
});

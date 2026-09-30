import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { AuthService } from '../auth/auth-service';
import { ChatService } from './chat-service';

const API = `${environment.apiUrl}/chat`;
const UUID = '6f1c2b1e-0000-4000-8000-000000000031';

describe('ChatService', () => {
  let service: ChatService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(ChatService);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
  });

  it('usa il token del nuovo visitatore', () => {
    service.creaVisitatore({ nome: 'Anna' }).subscribe();

    backend
      .expectOne(`${API}/visitatori`)
      .flush(risposta({ token: 'token-chat', visitatore: { uuid: UUID, nome: 'Anna' } }));
    expect(TestBed.inject(AuthService).token()).toBe('token-chat');
  });

  it('elenca le assistenze ancora da prendere', () => {
    service.elencaConversazioni({ tipo: 'assistenza', assegnate: 'libere' }).subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/conversazioni`);
    expect(richiesta.request.params.toString()).toBe('tipo=assistenza&assegnate=libere');
    richiesta.flush(risposta({ elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 }));
  });

  it("rimette l'assistenza tra le libere", () => {
    service.assegna(UUID, null).subscribe();

    const richiesta = backend.expectOne(`${API}/conversazioni/${UUID}/assegnatario`);
    expect(richiesta.request.method).toBe('PUT');
    expect(richiesta.request.body).toEqual({ utente_id: null });
    richiesta.flush(risposta({}));
  });

  it('invia il messaggio come multipart', () => {
    service
      .inviaMessaggio(UUID, { testo: 'Ecco la foto', allegati: [new File(['x'], 'a.jpg')] })
      .subscribe();

    const richiesta = backend.expectOne(`${API}/conversazioni/${UUID}/messaggi`);
    const corpo = richiesta.request.body as FormData;
    expect(corpo.get('testo')).toBe('Ecco la foto');
    expect(corpo.getAll('allegati')).toHaveLength(1);
    richiesta.flush(risposta({}));
  });

  it('carica lo storico prima di un messaggio', () => {
    service.elencaMessaggi(UUID, { prima_di: 90, limite: 30 }).subscribe();

    const richiesta = backend.expectOne(
      (req) => req.url === `${API}/conversazioni/${UUID}/messaggi`,
    );
    expect(richiesta.request.params.get('prima_di')).toBe('90');
    richiesta.flush(risposta([]));
  });
});

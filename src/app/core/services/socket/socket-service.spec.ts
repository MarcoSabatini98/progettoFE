import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../auth/auth-service';
import { APRI_SOCKET, SocketService } from './socket-service';

/** Socket finto: tiene gli ascoltatori per poter simulare gli eventi del server. */
const finto = (() => {
  const ascoltatori = new Map<string, (...dati: unknown[]) => void>();
  const socket = {
    active: false,
    on: (evento: string, fn: (...dati: unknown[]) => void) => ascoltatori.set(evento, fn),
    off: (evento: string) => ascoltatori.delete(evento),
    connect: vi.fn(),
    disconnect: vi.fn(),
    timeout: () => socket,
    emit: vi.fn(),
  };
  return { socket, ascoltatori, io: vi.fn(() => socket) };
})();

describe('SocketService', () => {
  const token = signal<string | null>('token-staff');
  const rinnova = vi.fn(() => of({}));
  const dimenticaTokenChat = vi.fn();
  let service: SocketService;

  beforeEach(() => {
    vi.clearAllMocks();
    finto.ascoltatori.clear();
    token.set('token-staff');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { token, collegato: () => true, rinnova, dimenticaTokenChat },
        },
        { provide: APRI_SOCKET, useValue: finto.io },
      ],
    });
    service = TestBed.inject(SocketService);
  });

  it('si collega al primo ascolto e smette quando nessuno ascolta più', () => {
    const ricevuti: unknown[] = [];
    const iscrizione = service.ascolta('chat:presenza').subscribe((d) => ricevuti.push(d));

    finto.ascoltatori.get('chat:presenza')?.({ utente_id: 2, stato: 'online' });
    iscrizione.unsubscribe();

    expect(finto.io).toHaveBeenCalledTimes(1);
    expect(finto.socket.connect).toHaveBeenCalled();
    expect(ricevuti).toEqual([{ utente_id: 2, stato: 'online' }]);
    expect(finto.ascoltatori.has('chat:presenza')).toBe(false);
  });

  it('restituisce la conferma del server', () => {
    finto.socket.emit.mockImplementation((_e, _d, conferma) => conferma(null, { successo: true }));
    let esito: unknown;

    service.emetti('chat:presenza', { stato: 'assente' }).subscribe((e) => (esito = e));

    expect(finto.socket.emit).toHaveBeenCalledWith(
      'chat:presenza',
      { stato: 'assente' },
      expect.any(Function),
    );
    expect(esito).toEqual({ successo: true });
  });

  it('con il token scaduto lo rinnova e si ricollega', () => {
    service.ascolta('notifica').subscribe();
    finto.socket.connect.mockClear();

    finto.ascoltatori.get('connect_error')?.({ data: { codice: 'TOKEN_SCADUTO' } });

    expect(rinnova).toHaveBeenCalled();
    expect(finto.socket.connect).toHaveBeenCalled();
  });

  it('dimentica il token del visitatore rifiutato senza riprovare', () => {
    service.ascolta('messaggio').subscribe();
    finto.socket.connect.mockClear();

    finto.ascoltatori.get('connect_error')?.({ data: { codice: 'TOKEN_CHAT_NON_VALIDO' } });

    expect(dimenticaTokenChat).toHaveBeenCalled();
    expect(finto.socket.connect).not.toHaveBeenCalled();
  });

  it("si scollega all'uscita dall'account", () => {
    service.ascolta('notifica').subscribe();

    token.set(null);
    TestBed.tick();

    expect(finto.socket.disconnect).toHaveBeenCalled();
  });
});

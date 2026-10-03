import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../auth/auth-service';
import { SocketService } from '../socket/socket-service';
import { EVENTI_SOCKET } from './chat-costanti';
import { PresenzeService } from './presenze-service';

describe('PresenzeService', () => {
  const eventi = new Map<string, Subject<unknown>>();
  const socket = {
    ascolta: (evento: string) => eventi.get(evento)!.asObservable(),
    emetti: vi.fn(() => of({ successo: true })),
  };
  let service: PresenzeService;

  beforeEach(() => {
    eventi.set(EVENTI_SOCKET.PRESENZE, new Subject());
    eventi.set(EVENTI_SOCKET.PRESENZA, new Subject());
    TestBed.configureTestingModule({
      providers: [
        { provide: SocketService, useValue: socket },
        { provide: AuthService, useValue: { utente: signal({ id: 1 }) } },
      ],
    });
    service = TestBed.inject(PresenzeService);
  });

  it("parte dall'elenco del collegamento e segue i cambi", () => {
    eventi.get(EVENTI_SOCKET.PRESENZE)!.next([
      { utente_id: 1, stato: 'online' },
      { utente_id: 2, stato: 'occupato' },
    ]);
    eventi.get(EVENTI_SOCKET.PRESENZA)!.next({ utente_id: 2, stato: 'assente' });

    expect(service.mia()).toBe('online');
    expect(service.di(2)).toBe('assente');
    expect(service.di(3)).toBe('offline');
  });

  it('manda il proprio stato allo staff', () => {
    service.imposta('occupato').subscribe();

    expect(socket.emetti).toHaveBeenCalledWith(EVENTI_SOCKET.PRESENZA, { stato: 'occupato' });
  });
});

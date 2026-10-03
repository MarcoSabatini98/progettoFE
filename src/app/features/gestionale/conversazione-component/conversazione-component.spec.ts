import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { EVENTI_SOCKET, MESSAGGI_PER_PAGINA } from '../../../core/services/chat/chat-costanti';
import { ChatService } from '../../../core/services/chat/chat-service';
import { PresenzeService } from '../../../core/services/chat/presenze-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { SocketService } from '../../../core/services/socket/socket-service';
import { MessaggioInterface } from '../../../shared/models/messaggio/messaggio-model';
import { ConversazioneComponent } from './conversazione-component';

describe('ConversazioneComponent', () => {
  const UUID = '6f1c2b1e-0000-4000-8000-000000000051';
  const chat = {
    leggiConversazione: vi.fn(),
    elencaMessaggi: vi.fn(),
    segnaLetto: vi.fn(),
  };
  let eventi: Map<string, Subject<unknown>>;
  const evento = (nome: string) => {
    if (!eventi.has(nome)) {
      eventi.set(nome, new Subject());
    }
    return eventi.get(nome)!;
  };
  const messaggio = (id: number, mittente = 2) =>
    ({
      id,
      testo: `Messaggio ${id}`,
      mittente_utente_id: mittente,
      di_sistema: false,
      inviato_il: '2026-10-04T10:00:00Z',
      mittente_utente: { nome: 'Anna', cognome: 'Bianchi' },
    }) as unknown as MessaggioInterface;
  const dettaglio = (stato = 'aperta') => ({
    uuid: UUID,
    tipo: 'staff',
    titolo: null,
    stato,
    partecipanti: [
      { id: 1, nome: 'Marco', cognome: 'Rossi' },
      { id: 2, nome: 'Anna', cognome: 'Bianchi' },
    ],
  });

  beforeEach(() => {
    eventi = new Map();
    Object.values(chat).forEach((spia) => spia.mockReset());
    chat.leggiConversazione.mockReturnValue(of(dettaglio()));
    chat.elencaMessaggi.mockReturnValue(of([messaggio(10)]));
    chat.segnaLetto.mockReturnValue(of(null));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: ChatService, useValue: chat },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: AuthService, useValue: { utente: () => ({ id: 1 }) } },
        { provide: PresenzeService, useValue: { di: () => 'online' } },
        {
          provide: SocketService,
          useValue: { ascolta: evento, emetti: () => of({ successo: true }) },
        },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ConversazioneComponent);
    fixture.componentRef.setInput('uuid', UUID);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const ricevi = async (nome: string, dati: object) => {
      evento(nome).next({ conversazione: UUID, ...dati });
      await fixture.whenStable();
    };
    const testi = () =>
      Array.from(elemento.querySelectorAll('app-messaggio-chat')).map(
        (m) => m.textContent?.match(/Messaggio \d+/)?.[0],
      );
    return { fixture, elemento, ricevi, testi };
  }

  it("apre la chat diretta con il nome dell'altro e la segna letta", async () => {
    const { elemento, testi } = await crea();

    expect(elemento.querySelector('h2')?.textContent).toContain('Anna Bianchi');
    expect(elemento.querySelectorAll('.partecipanti .presenza')).toHaveLength(2);
    expect(testi()).toEqual(['Messaggio 10']);
    expect(chat.segnaLetto).toHaveBeenCalledWith(UUID);
    expect(elemento.querySelector('app-scrivi-messaggio')).not.toBeNull();
  });

  it('aggiunge, cambia e toglie i messaggi in tempo reale, solo di questa conversazione', async () => {
    const { ricevi, testi } = await crea();
    chat.segnaLetto.mockClear();

    await ricevi(EVENTI_SOCKET.MESSAGGIO, { messaggio: messaggio(11) });
    await ricevi(EVENTI_SOCKET.MESSAGGIO, { messaggio: messaggio(11) });
    evento(EVENTI_SOCKET.MESSAGGIO).next({ conversazione: 'altra', messaggio: messaggio(12) });
    expect(testi()).toEqual(['Messaggio 10', 'Messaggio 11']);
    expect(chat.segnaLetto).toHaveBeenCalledTimes(2);

    await ricevi(EVENTI_SOCKET.MESSAGGIO_MODIFICATO, {
      messaggio: { ...messaggio(10), testo: 'Messaggio 99' },
    });
    await ricevi(EVENTI_SOCKET.MESSAGGIO_ELIMINATO, { messaggio_id: 11 });
    expect(testi()).toEqual(['Messaggio 99']);
  });

  it('con una pagina piena carica i precedenti e li mette in cima', async () => {
    const pagina = Array.from({ length: MESSAGGI_PER_PAGINA }, (_, i) => messaggio(100 + i));
    chat.elencaMessaggi.mockReturnValueOnce(of(pagina)).mockReturnValueOnce(of([messaggio(50)]));
    const { fixture, elemento, testi } = await crea();
    const precedenti = () =>
      Array.from(elemento.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('gestionale.chat.conversazione.precedenti'),
      );

    precedenti()!.click();
    await fixture.whenStable();

    expect(chat.elencaMessaggi).toHaveBeenLastCalledWith(UUID, { prima_di: 100 });
    expect(testi()[0]).toBe('Messaggio 50');
    expect(precedenti()).toBeUndefined();
  });

  it('mostra chi sta scrivendo, ma non se stessi', async () => {
    const { elemento, ricevi } = await crea();
    const scrive = () => elemento.querySelector('.scrive')?.textContent?.trim();

    await ricevi(EVENTI_SOCKET.SCRIVE, { utente_id: 1, attivo: true });
    expect(scrive()).toBe('');
    await ricevi(EVENTI_SOCKET.SCRIVE, { utente_id: 2, attivo: true });
    expect(scrive()).toContain('gestionale.chat.conversazione.scrive');
    await ricevi(EVENTI_SOCKET.SCRIVE, { utente_id: 2, attivo: false });
    expect(scrive()).toBe('');
  });

  it('chiusa non si può scrivere; riaperta dal socket sì', async () => {
    chat.leggiConversazione.mockReturnValue(of(dettaglio('chiusa')));
    const { elemento, ricevi } = await crea();

    expect(elemento.querySelector('app-scrivi-messaggio')).toBeNull();
    expect(elemento.textContent).toContain('gestionale.chat.conversazione.chiusa');

    await ricevi(EVENTI_SOCKET.CONVERSAZIONE, { dettaglio: dettaglio() });
    expect(elemento.querySelector('app-scrivi-messaggio')).not.toBeNull();
  });
});

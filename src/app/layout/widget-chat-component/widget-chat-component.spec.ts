import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../core/services/auth/auth-service';
import { AvvisiService } from '../../core/services/avvisi/avvisi-service';
import { EVENTI_SOCKET } from '../../core/services/chat/chat-costanti';
import { ChatService } from '../../core/services/chat/chat-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { SocketService } from '../../core/services/socket/socket-service';
import { MessaggioInterface } from '../../shared/models/messaggio/messaggio-model';
import { WidgetChatComponent } from './widget-chat-component';

describe('WidgetChatComponent', () => {
  const UUID = '6f1c2b1e-0000-4000-8000-000000000071';
  const chat = {
    assistenzaDisponibile: vi.fn(),
    elencaConversazioni: vi.fn(),
    creaVisitatore: vi.fn(),
    apriAssistenza: vi.fn(),
    elencaMessaggi: vi.fn(),
    segnaLetto: vi.fn(),
  };
  let auth: {
    token: ReturnType<typeof signal<string | null>>;
    collegato: ReturnType<typeof signal<boolean>>;
    utente: ReturnType<typeof signal<{ id: number } | null>>;
  };
  let eventi: Map<string, Subject<unknown>>;
  const evento = (nome: string) => {
    if (!eventi.has(nome)) {
      eventi.set(nome, new Subject());
    }
    return eventi.get(nome)!;
  };
  const conversazione = (stato = 'aperta') => ({ uuid: UUID, tipo: 'assistenza', stato });
  const messaggio = (id: number, extra: Partial<MessaggioInterface> = {}) =>
    ({
      id,
      testo: `Messaggio ${id}`,
      mittente_utente_id: null,
      mittente_visitatore_id: 4,
      di_sistema: false,
      inviato_il: '2026-10-05T10:00:00Z',
      ...extra,
    }) as unknown as MessaggioInterface;
  const dallaStaff = messaggio(11, {
    mittente_utente_id: 2,
    mittente_visitatore_id: null,
    mittente_utente: { nome: 'Anna', cognome: 'Bianchi' },
  } as Partial<MessaggioInterface>);

  beforeEach(() => {
    eventi = new Map();
    auth = { token: signal(null), collegato: signal(false), utente: signal(null) };
    Object.values(chat).forEach((spia) => spia.mockReset());
    chat.assistenzaDisponibile.mockReturnValue(of(true));
    chat.elencaConversazioni.mockReturnValue(of({ elementi: [] }));
    chat.elencaMessaggi.mockReturnValue(of([messaggio(10)]));
    chat.segnaLetto.mockReturnValue(of(null));
    chat.apriAssistenza.mockReturnValue(of(conversazione()));
    chat.creaVisitatore.mockImplementation(() => {
      auth.token.set('token-visitatore');
      return of({ token: 'token-visitatore', visitatore: { uuid: 'v', nome: null } });
    });
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ChatService, useValue: chat },
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        {
          provide: SocketService,
          useValue: { ascolta: evento, emetti: () => of({ successo: true }) },
        },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(WidgetChatComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const stabile = () => fixture.whenStable();
    const alterna = async () => {
      elemento.querySelector<HTMLButtonElement>('.lancia')!.click();
      await stabile();
    };
    return { elemento, stabile, alterna };
  }

  it('chiuso mostra solo il pulsante e non chiama nessuno', async () => {
    const { elemento } = await crea();

    expect(elemento.querySelector('.riquadro')).toBeNull();
    expect(chat.assistenzaDisponibile).not.toHaveBeenCalled();
  });

  it('il visitatore lascia nome ed email e apre la conversazione col primo messaggio', async () => {
    const { elemento, stabile, alterna } = await crea();
    await alterna();

    expect(elemento.querySelector('.disponibile.online')).not.toBeNull();
    const campo = (nome: string) =>
      elemento.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[formControlName="${nome}"]`,
      )!;
    campo('nome').value = 'Giulia';
    campo('nome').dispatchEvent(new Event('input'));
    campo('testo').value = 'Avete il parcheggio?';
    campo('testo').dispatchEvent(new Event('input'));
    elemento.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await stabile();

    expect(chat.creaVisitatore).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Giulia', email: '' }),
    );
    expect(chat.apriAssistenza).toHaveBeenCalledWith({ testo: 'Avete il parcheggio?' });
    expect(chat.elencaMessaggi).toHaveBeenCalledWith(UUID);
    expect(elemento.querySelector('app-messaggio-chat')?.classList).toContain('mio');
    expect(elemento.querySelector('app-scrivi-messaggio')).not.toBeNull();
  });

  it('il cliente collegato riprende la conversazione aperta, senza nome ed email', async () => {
    auth.token.set('token-cliente');
    auth.collegato.set(true);
    auth.utente.set({ id: 7 });
    chat.elencaConversazioni.mockReturnValue(of({ elementi: [conversazione()] }));
    chat.elencaMessaggi.mockReturnValue(of([dallaStaff]));
    const { elemento, alterna } = await crea();
    await alterna();

    expect(chat.elencaConversazioni).toHaveBeenCalledWith({ stato: 'aperta' });
    expect(chat.segnaLetto).toHaveBeenCalledWith(UUID);
    expect(elemento.querySelector('app-messaggio-chat')?.classList).not.toContain('mio');
    expect(elemento.querySelector('[formControlName="nome"]')).toBeNull();
  });

  it('una risposta a riquadro chiuso accende il pallino, aprendo si legge', async () => {
    auth.token.set('token-visitatore');
    const { elemento, stabile, alterna } = await crea();

    evento(EVENTI_SOCKET.MESSAGGIO).next({
      conversazione: UUID,
      messaggio: dallaStaff,
      dettaglio: conversazione(),
    });
    await stabile();
    expect(elemento.querySelector('.nuovi')).not.toBeNull();

    await alterna();
    expect(elemento.querySelector('.nuovi')).toBeNull();
    expect(chat.segnaLetto).toHaveBeenCalledWith(UUID);
  });

  it('chiusa dallo staff, offre di aprirne una nuova', async () => {
    auth.token.set('token-visitatore');
    chat.elencaConversazioni.mockReturnValue(of({ elementi: [conversazione()] }));
    const { elemento, stabile, alterna } = await crea();
    await alterna();

    evento(EVENTI_SOCKET.CONVERSAZIONE).next({
      conversazione: UUID,
      dettaglio: conversazione('chiusa'),
    });
    await stabile();
    expect(elemento.querySelector('app-scrivi-messaggio')).toBeNull();

    elemento.querySelector<HTMLButtonElement>('.riquadro .pulsante-secondario')!.click();
    await stabile();
    expect(elemento.querySelector('form.avvio')).not.toBeNull();
  });
});

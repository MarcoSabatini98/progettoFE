import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { EVENTI_SOCKET } from '../../../core/services/chat/chat-costanti';
import { ChatService } from '../../../core/services/chat/chat-service';
import { PresenzeService } from '../../../core/services/chat/presenze-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { SocketService } from '../../../core/services/socket/socket-service';
import { ChatComponent } from './chat-component';

describe('ChatComponent', () => {
  const chat = { elencaConversazioni: vi.fn(), contaNonLetti: vi.fn() };
  const presenze = { mia: () => 'online', imposta: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  let messaggi: Subject<unknown>;

  const pagina = (titoli: string[]) => ({
    elementi: titoli.map((titolo, i) => ({ uuid: `u${i}`, tipo: 'staff', titolo })),
    totale: titoli.length,
    pagina: 1,
    perPagina: 10,
    pagine: 1,
  });

  function configura(assistenza: boolean) {
    messaggi = new Subject();
    Object.values(chat).forEach((spia) => spia.mockReset());
    chat.elencaConversazioni.mockReturnValue(of(pagina(['Turno'])));
    chat.contaNonLetti.mockReturnValue(of({ staff: 2, assistenza: 1, libere: 3 }));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: ChatService, useValue: chat },
        { provide: PresenzeService, useValue: presenze },
        { provide: AvvisiService, useValue: avvisi },
        {
          provide: AuthService,
          useValue: { haPermessi: () => assistenza, utente: () => ({ id: 1 }) },
        },
        {
          provide: SocketService,
          useValue: {
            ascolta: (evento: string) =>
              evento === EVENTI_SOCKET.MESSAGGIO ? messaggi : new Subject(),
          },
        },
      ],
    });
  }

  async function crea() {
    const fixture = TestBed.createComponent(ChatComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => configura(true));

  it('elenca le chat dello staff e, con l’assistenza, mostra le schede con i badge', async () => {
    const { fixture, elemento } = await crea();

    expect(chat.elencaConversazioni).toHaveBeenCalledWith({
      tipo: 'staff',
      stato: 'aperta',
      assegnate: undefined,
      pagina: 1,
      perPagina: 10,
    });
    expect(elemento.querySelectorAll('app-riga-conversazione')).toHaveLength(1);
    const badge = Array.from(elemento.querySelectorAll('.schede .conteggio')).map((b) =>
      b.textContent?.trim(),
    );
    expect(badge).toEqual(['4', '2']);

    elemento.querySelector<HTMLButtonElement>('.schede button')!.click();
    await fixture.whenStable();
    expect(chat.elencaConversazioni).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipo: 'assistenza' }),
    );
    expect(elemento.textContent).toContain('gestionale.chat.filtri.assegnate');
  });

  it('senza permesso di assistenza niente schede', async () => {
    TestBed.resetTestingModule();
    configura(false);
    const { elemento } = await crea();

    expect(elemento.querySelector('.schede')).toBeNull();
  });

  it('una raffica di eventi dal socket ricarica elenco e contatori una volta', async () => {
    const { fixture } = await crea();
    chat.elencaConversazioni.mockClear();

    messaggi.next({});
    messaggi.next({});
    // ponytail: attesa vera oltre il debounce (300 ms), i timer finti bloccano whenStable
    await new Promise((fine) => setTimeout(fine, 350));
    await fixture.whenStable();

    expect(chat.elencaConversazioni).toHaveBeenCalledTimes(1);
    expect(chat.contaNonLetti).toHaveBeenCalledTimes(2);
  });

  it('il cambio di presenza rifiutato mostra il motivo', async () => {
    presenze.imposta.mockReturnValue(
      of({ successo: false, errore: { codice: 'STATO_PRESENZA_NON_VALIDO', messaggio: 'No' } }),
    );
    const { fixture, elemento } = await crea();
    const scelta = elemento.querySelector<HTMLSelectElement>('select')!;

    scelta.value = 'occupato';
    scelta.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(presenze.imposta).toHaveBeenCalledWith('occupato');
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'errore');
  });
});

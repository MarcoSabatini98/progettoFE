import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ChatService } from '../../../core/services/chat/chat-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { MessaggioInterface } from '../../../shared/models/messaggio/messaggio-model';
import { MessaggioChatComponent } from './messaggio-chat-component';

describe('MessaggioChatComponent', () => {
  const chat = {
    modificaMessaggio: vi.fn(),
    eliminaMessaggio: vi.fn(),
    scaricaAllegato: vi.fn(),
  };
  const messaggio = {
    id: 7,
    testo: 'Camera 101 pronta',
    di_sistema: false,
    inviato_il: '2026-10-03T10:00:00Z',
    modificato_il: null,
    mittente_utente: { nome: 'Anna', cognome: 'Bianchi' },
    allegati: [{ id: 4, nome_originale: 'foto.jpg' }],
  } as unknown as MessaggioInterface;

  beforeEach(() => {
    Object.values(chat).forEach((spia) => spia.mockReset());
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ChatService, useValue: chat },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      ],
    });
  });

  async function crea(mio: boolean) {
    const fixture = TestBed.createComponent(MessaggioChatComponent);
    fixture.componentRef.setInput('messaggio', messaggio);
    fixture.componentRef.setInput('mio', mio);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const premi = async (chiave: string) => {
      Array.from(elemento.querySelectorAll('button'))
        .find((b) => (b.getAttribute('aria-label') ?? b.textContent)?.includes(chiave))!
        .click();
      await fixture.whenStable();
    };
    return { fixture, elemento, premi };
  }

  it('mostra il mittente degli altri e permette solo di rispondere', async () => {
    const { fixture, elemento, premi } = await crea(false);
    const risposte: MessaggioInterface[] = [];
    fixture.componentInstance.rispondi.subscribe((m) => risposte.push(m));

    expect(elemento.querySelector('.mittente')?.textContent).toContain('Anna Bianchi');
    expect(elemento.querySelector('[aria-label="gestionale.chat.messaggio.elimina"]')).toBeNull();
    await premi('gestionale.chat.messaggio.rispondi');
    expect(risposte).toEqual([messaggio]);
  });

  it('modifica il proprio messaggio', async () => {
    chat.modificaMessaggio.mockReturnValue(of({ ...messaggio, testo: 'Camera 102 pronta' }));
    const { fixture, elemento, premi } = await crea(true);
    const modificati: MessaggioInterface[] = [];
    fixture.componentInstance.modificato.subscribe((m) => modificati.push(m));

    await premi('gestionale.chat.messaggio.modifica');
    const campo = elemento.querySelector('textarea')!;
    campo.value = 'Camera 102 pronta';
    campo.dispatchEvent(new Event('input'));
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(chat.modificaMessaggio).toHaveBeenCalledWith(7, 'Camera 102 pronta');
    expect(modificati[0].testo).toBe('Camera 102 pronta');
    expect(elemento.querySelector('textarea')).toBeNull();
  });

  it('elimina solo dopo la conferma', async () => {
    chat.eliminaMessaggio.mockReturnValue(of(null));
    const { fixture, premi } = await crea(true);
    const eliminati: number[] = [];
    fixture.componentInstance.eliminato.subscribe((id) => eliminati.push(id));

    await premi('gestionale.chat.messaggio.elimina');
    expect(chat.eliminaMessaggio).not.toHaveBeenCalled();
    await premi('gestionale.chat.messaggio.conferma');

    expect(eliminati).toEqual([7]);
  });

  it("scarica l'allegato con l'id dell'allegato", async () => {
    chat.scaricaAllegato.mockReturnValue(of(new Blob(['x'])));
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const { premi } = await crea(false);

    await premi('foto.jpg');

    expect(chat.scaricaAllegato).toHaveBeenCalledWith(4);
  });
});

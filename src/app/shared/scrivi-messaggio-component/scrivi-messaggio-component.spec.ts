import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatService } from '../../core/services/chat/chat-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { SocketService } from '../../core/services/socket/socket-service';
import { MessaggioInterface } from '../models/messaggio/messaggio-model';
import { ScriviMessaggioComponent } from './scrivi-messaggio-component';

describe('ScriviMessaggioComponent', () => {
  const UUID = '6f1c2b1e-0000-4000-8000-000000000031';
  const chat = { inviaMessaggio: vi.fn() };
  const socket = { emetti: vi.fn(() => of({ successo: true })) };

  beforeEach(() => {
    chat.inviaMessaggio.mockReset().mockReturnValue(of({ id: 9 }));
    socket.emetti.mockClear();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ChatService, useValue: chat },
        { provide: SocketService, useValue: socket },
      ],
    });
  });

  async function crea(rispondiA: Partial<MessaggioInterface> | null = null) {
    const fixture = TestBed.createComponent(ScriviMessaggioComponent);
    fixture.componentRef.setInput('uuid', UUID);
    fixture.componentRef.setInput('rispondiA', rispondiA);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const campo = elemento.querySelector('textarea')!;
    const scrivi = (testo: string) => {
      campo.value = testo;
      campo.dispatchEvent(new Event('input'));
    };
    const premi = async (tasto: KeyboardEventInit) => {
      campo.dispatchEvent(new KeyboardEvent('keydown', tasto));
      await fixture.whenStable();
    };
    return { fixture, elemento, campo, scrivi, premi };
  }

  it('con Invio manda il messaggio in risposta e avvisa che ha smesso di scrivere', async () => {
    const { fixture, campo, scrivi, premi } = await crea({ id: 3, testo: 'Domanda' });
    const inviati: MessaggioInterface[] = [];
    fixture.componentInstance.inviato.subscribe((m) => inviati.push(m));

    scrivi('Risposta');
    await premi({ key: 'Enter' });

    expect(chat.inviaMessaggio).toHaveBeenCalledWith(UUID, {
      testo: 'Risposta',
      risposta_a_id: 3,
      allegati: [],
    });
    expect(socket.emetti).toHaveBeenCalledWith('chat:scrive', {
      conversazione: UUID,
      attivo: true,
    });
    expect(socket.emetti).toHaveBeenLastCalledWith('chat:scrive', {
      conversazione: UUID,
      attivo: false,
    });
    expect(inviati).toHaveLength(1);
    expect(campo.value).toBe('');
  });

  it('con Maiusc+Invio non manda e un testo vuoto non parte', async () => {
    const { scrivi, premi } = await crea();

    scrivi('Prima riga');
    await premi({ key: 'Enter', shiftKey: true });
    scrivi('   ');
    await premi({ key: 'Enter' });

    expect(chat.inviaMessaggio).not.toHaveBeenCalled();
  });

  it('non accetta più allegati del massimo', async () => {
    const { fixture, elemento } = await crea();
    const input = elemento.querySelector<HTMLInputElement>('input[type=file]')!;
    const file = Array.from({ length: 6 }, (_, i) => new File(['x'], `f${i}.jpg`));
    Object.defineProperty(input, 'files', { value: file, configurable: true });

    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain(
      'gestionale.chat.scrivi.troppiAllegati',
    );
    expect(elemento.querySelectorAll('.allegati li')).toHaveLength(0);
  });
});

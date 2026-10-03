import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatService } from '../../../core/services/chat/chat-service';
import { PresenzeService } from '../../../core/services/chat/presenze-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { NuovaChatComponent } from './nuova-chat-component';

describe('NuovaChatComponent', () => {
  const UUID = '6f1c2b1e-0000-4000-8000-000000000031';
  const chat = { elencaColleghi: vi.fn(), apriChatStaff: vi.fn() };

  beforeEach(() => {
    chat.elencaColleghi.mockReturnValue(
      of([
        { id: 2, nome: 'Anna', cognome: 'Bianchi', ruolo: 'housekeeper', presenza: 'online' },
        { id: 3, nome: 'Luca', cognome: 'Verdi', ruolo: 'receptionist', presenza: 'offline' },
      ]),
    );
    chat.apriChatStaff.mockReset().mockReturnValue(of({ uuid: UUID }));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: ChatService, useValue: chat },
        { provide: PresenzeService, useValue: { di: () => 'online' } },
      ],
    });
  });

  async function crea() {
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(NuovaChatComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const scegli = async (indice: number) => {
      elemento.querySelectorAll<HTMLInputElement>('input[type=checkbox]')[indice].click();
      await fixture.whenStable();
    };
    const scrivi = async (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, scegli, scrivi, invia, naviga };
  }

  it('apre la chat diretta e porta alla conversazione', async () => {
    const { elemento, scegli, scrivi, invia, naviga } = await crea();

    await scegli(0);
    expect(elemento.querySelector('input[formControlName=titolo]')).toBeNull();
    await scrivi('textarea', 'Ciao');
    await invia();

    expect(chat.apriChatStaff).toHaveBeenCalledWith({
      partecipanti: [2],
      titolo: undefined,
      testo: 'Ciao',
    });
    expect(naviga).toHaveBeenCalledWith(['/staff/chat', UUID]);
  });

  it('per un gruppo chiede il nome prima di partire', async () => {
    const { elemento, scegli, scrivi, invia } = await crea();

    await scegli(0);
    await scegli(1);
    await scrivi('textarea', 'Riunione alle 15');
    await invia();
    expect(chat.apriChatStaff).not.toHaveBeenCalled();

    await scrivi('input[formControlName=titolo]', 'Turno');
    await invia();
    expect(chat.apriChatStaff).toHaveBeenCalledWith({
      partecipanti: [2, 3],
      titolo: 'Turno',
      testo: 'Riunione alle 15',
    });
    expect(elemento.textContent).toContain('gestionale.ruoli.housekeeper');
  });

  it('senza colleghi scelti avvisa, e mostra i rifiuti del backend', async () => {
    const { elemento, scegli, scrivi, invia } = await crea();

    await scrivi('textarea', 'Ciao');
    await invia();
    expect(elemento.querySelector('[role=alert]')?.textContent).toContain(
      'gestionale.chat.nuovaChat.nessunoScelto',
    );

    chat.apriChatStaff.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { errore: { codice: 'CHAT_NON_CONSENTITA', messaggio: 'No' } },
          }),
      ),
    );
    await scegli(0);
    await invia();
    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

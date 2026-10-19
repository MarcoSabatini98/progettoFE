import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PermessiService } from '../../../core/services/permessi/permessi-service';
import { RegoleChatComponent } from './regole-chat-component';

describe('RegoleChatComponent', () => {
  const ruoli = { impostaRegoleChat: vi.fn() };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    ruoli.impostaRegoleChat.mockReset();
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PermessiService, useValue: ruoli },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(RegoleChatComponent);
    fixture.componentRef.setInput('ruoli', ['receptionist', 'admin']);
    fixture.componentRef.setInput('regole', [{ ruolo_a: 'admin', ruolo_b: 'receptionist' }]);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const caselle = () => [...elemento.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, caselle, salva };
  }

  it('una casella per coppia di ruoli, colleghi compresi', async () => {
    const { elemento, caselle } = await crea();

    // admin-admin, admin-receptionist, receptionist-receptionist
    expect(caselle().map((casella) => casella.checked)).toEqual([false, true, false]);
    expect(elemento.textContent).toContain('gestionale.permessi.chat.colleghi');
    expect(elemento.textContent).toContain('gestionale.permessi.chat.coppia');
  });

  it('salva le coppie spuntate in ordine alfabetico', async () => {
    ruoli.impostaRegoleChat.mockReturnValue(of([]));
    const { caselle, salva } = await crea();

    caselle()[2].click();
    await salva();

    expect(ruoli.impostaRegoleChat).toHaveBeenCalledWith([
      ['admin', 'receptionist'],
      ['receptionist', 'receptionist'],
    ]);
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.permessi.chat.salvate', 'successo');
  });

  it("mostra l'errore del backend", async () => {
    ruoli.impostaRegoleChat.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errore: { codice: 'RUOLO_NON_STAFF', messaggio: 'Solo staff' } },
          }),
      ),
    );
    const { elemento, salva } = await crea();

    await salva();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Solo staff');
  });
});

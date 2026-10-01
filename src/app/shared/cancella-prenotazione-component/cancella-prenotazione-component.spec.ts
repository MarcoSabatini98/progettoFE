import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../core/services/prenotazioni/prenotazioni-service';
import { CancellaPrenotazioneComponent } from './cancella-prenotazione-component';

describe('CancellaPrenotazioneComponent', () => {
  const prenotazioni = { anteprimaCancellazione: vi.fn(), cancellaPrenotazione: vi.fn() };

  beforeEach(() => {
    Object.values(prenotazioni).forEach((spia) => spia.mockReset());
    prenotazioni.anteprimaCancellazione.mockReturnValue(
      of({ penale: 30, gratuita_fino_al: null, incassato: 90 }),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function apri(staff = false) {
    const fixture = TestBed.createComponent(CancellaPrenotazioneComponent);
    fixture.componentRef.setInput('prenotazioneId', 7);
    fixture.componentRef.setInput('staff', staff);
    const cancellata = vi.fn();
    fixture.componentInstance.cancellata.subscribe(cancellata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    expect(prenotazioni.anteprimaCancellazione).not.toHaveBeenCalled();
    elemento.querySelector<HTMLButtonElement>('button')?.click();
    await fixture.whenStable();
    const conferma = async (motivo: string) => {
      const campo = elemento.querySelector('textarea')!;
      campo.value = motivo;
      campo.dispatchEvent(new Event('input'));
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, cancellata, conferma };
  }

  it('prima di confermare mostra penale e rimborso', async () => {
    const { elemento } = await apri();

    expect(prenotazioni.anteprimaCancellazione).toHaveBeenCalledWith(7, true);
    expect(
      [...elemento.querySelectorAll('dd')].map((dd) => dd.textContent?.replace(/\s/g, ' ').trim()),
    ).toEqual(['30,00 €', '60,00 €']);
  });

  it('conferma col motivo e avvisa che è cancellata', async () => {
    prenotazioni.cancellaPrenotazione.mockReturnValue(of({}));
    const { cancellata, conferma } = await apri();

    await conferma('  Cambio di programma ');

    expect(prenotazioni.cancellaPrenotazione).toHaveBeenCalledWith(
      7,
      { motivo: 'Cambio di programma' },
      true,
    );
    expect(cancellata).toHaveBeenCalled();
  });

  it('il cliente non vede la penale da applicare', async () => {
    const { elemento } = await apri();

    expect(elemento.querySelector('input[type="number"]')).toBeNull();
  });

  it('lo staff usa le sue rotte e può cambiare la penale', async () => {
    prenotazioni.cancellaPrenotazione.mockReturnValue(of({}));
    const { elemento, conferma } = await apri(true);
    const penale = elemento.querySelector<HTMLInputElement>('input[type="number"]')!;

    penale.value = '40';
    penale.dispatchEvent(new Event('input'));
    await conferma('');

    expect(prenotazioni.anteprimaCancellazione).toHaveBeenCalledWith(7, false);
    expect(prenotazioni.cancellaPrenotazione).toHaveBeenCalledWith(
      7,
      { motivo: null, penale: 40 },
      false,
    );
  });

  it('se il backend rifiuta spiega perché', async () => {
    prenotazioni.cancellaPrenotazione.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'SOGGIORNO_INIZIATO', messaggio: 'Già iniziato' } },
          }),
      ),
    );
    const { elemento, cancellata, conferma } = await apri();

    await conferma('');

    expect(prenotazioni.cancellaPrenotazione).toHaveBeenCalledWith(7, { motivo: null }, true);
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Già iniziato');
    expect(cancellata).not.toHaveBeenCalled();
  });
});

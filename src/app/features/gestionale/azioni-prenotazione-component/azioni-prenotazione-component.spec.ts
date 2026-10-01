import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import {
  PrenotazioneInterface,
  StatoPrenotazione,
} from '../../../shared/models/prenotazione/prenotazione-model';
import { AzioniPrenotazioneComponent } from './azioni-prenotazione-component';

describe('AzioniPrenotazioneComponent', () => {
  const prenotazioni = {
    confermaPrenotazione: vi.fn(),
    checkIn: vi.fn(),
    segnaNoShow: vi.fn(),
    checkOut: vi.fn(),
  };
  const auth = { haPermessi: vi.fn() };

  beforeEach(() => {
    [...Object.values(prenotazioni), auth.haPermessi].forEach((spia) => spia.mockReset());
    auth.haPermessi.mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  async function crea(stato: StatoPrenotazione) {
    const fixture = TestBed.createComponent(AzioniPrenotazioneComponent);
    fixture.componentRef.setInput('prenotazione', { id: 7, stato } as PrenotazioneInterface);
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const pulsanti = () => [...elemento.querySelectorAll('button')];
    const clicca = async (testo: string) => {
      pulsanti()
        .find((pulsante) => pulsante.textContent?.includes(testo))
        ?.click();
      await fixture.whenStable();
    };
    return { elemento, pulsanti, clicca, aggiornata };
  }

  it('confermata: arrivo e mancato arrivo, se i permessi lo consentono', async () => {
    auth.haPermessi.mockImplementation(([permesso]) => permesso === 'checkin.gestisci');

    const { pulsanti } = await crea('confermata');

    expect(pulsanti().map((pulsante) => pulsante.textContent?.trim())).toEqual([
      'gestionale.azioni.checkIn',
    ]);
  });

  it('nelle prenotazioni chiuse non propone nulla', async () => {
    const { pulsanti } = await crea('conclusa');

    expect(pulsanti()).toHaveLength(0);
  });

  it('conferma la prenotazione in attesa e avvisa chi la mostra', async () => {
    prenotazioni.confermaPrenotazione.mockReturnValue(of({}));
    const { clicca, aggiornata } = await crea('in_attesa');

    await clicca('gestionale.azioni.conferma');

    expect(prenotazioni.confermaPrenotazione).toHaveBeenCalledWith(7);
    expect(aggiornata).toHaveBeenCalled();
  });

  it('il mancato arrivo chiede un secondo tocco', async () => {
    prenotazioni.segnaNoShow.mockReturnValue(of({}));
    const { clicca } = await crea('confermata');

    await clicca('gestionale.azioni.noShow');
    expect(prenotazioni.segnaNoShow).not.toHaveBeenCalled();

    await clicca('gestionale.azioni.conferme.noShow');
    expect(prenotazioni.segnaNoShow).toHaveBeenCalledWith(7);
  });

  it('con il saldo aperto il check-out si ripete forzato', async () => {
    prenotazioni.checkOut.mockReturnValueOnce(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'SALDO_APERTO', messaggio: 'Restano 50 €' } },
          }),
      ),
    );
    prenotazioni.checkOut.mockReturnValueOnce(of({}));
    const { elemento, clicca, aggiornata } = await crea('in_soggiorno');

    await clicca('gestionale.azioni.checkOut');
    expect(prenotazioni.checkOut).toHaveBeenLastCalledWith(7, false);
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Restano 50 €');

    await clicca('gestionale.azioni.conferme.checkOut');
    expect(prenotazioni.checkOut).toHaveBeenLastCalledWith(7, true);
    expect(aggiornata).toHaveBeenCalled();
  });
});

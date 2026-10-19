import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { LinkCheckinComponent } from './link-checkin-component';

describe('LinkCheckinComponent', () => {
  const prenotazioni = { creaLinkCheckin: vi.fn() };

  beforeEach(() => {
    prenotazioni.creaLinkCheckin.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: PrenotazioniService, useValue: prenotazioni }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(LinkCheckinComponent);
    fixture.componentRef.setInput('prenotazioneId', 7);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    elemento.querySelector('button')?.click();
    await fixture.whenStable();
    return elemento;
  }

  it('crea il link e lo mostra da copiare', async () => {
    prenotazioni.creaLinkCheckin.mockReturnValue(of('https://esempio.it/checkin/abc'));

    const elemento = await crea();

    expect(prenotazioni.creaLinkCheckin).toHaveBeenCalledWith(7);
    expect(elemento.querySelector('input')?.value).toBe('https://esempio.it/checkin/abc');
  });

  it('se il backend rifiuta spiega perché', async () => {
    prenotazioni.creaLinkCheckin.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'STATO_NON_VALIDO', messaggio: 'Già arrivati' } },
          }),
      ),
    );

    const elemento = await crea();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Già arrivati');
    expect(elemento.querySelector('input')).toBeNull();
  });
});

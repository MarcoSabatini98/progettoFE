import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { PreferenzeEmailComponent } from './preferenze-email-component';

describe('PreferenzeEmailComponent', () => {
  const utenti = { aggiornaPreferenzeEmail: vi.fn() };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ profilo: { salvato: 'Salvato' } })],
      providers: [
        { provide: UtentiService, useValue: utenti },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  /** Clicca la casella n-esima: 0 notifiche, 1 offerte. */
  async function clicca(indice: number) {
    const fixture = TestBed.createComponent(PreferenzeEmailComponent);
    fixture.componentRef.setInput('preferenze', { notifiche_email: true, email_marketing: false });
    await fixture.whenStable();
    const caselle = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    caselle[indice].click();
    await fixture.whenStable();
    return caselle;
  }

  it('salva subito la sola voce cambiata', async () => {
    utenti.aggiornaPreferenzeEmail.mockReturnValue(
      of({ notifiche_email: true, email_marketing: true }),
    );

    const caselle = await clicca(1);

    expect(utenti.aggiornaPreferenzeEmail).toHaveBeenCalledWith({ email_marketing: true });
    expect(caselle[0].checked).toBe(true);
    expect(caselle[1].checked).toBe(true);
    expect(avvisi.mostra).toHaveBeenCalledWith('Salvato', 'successo');
  });

  it('se il salvataggio fallisce rimette la casella com’era', async () => {
    utenti.aggiornaPreferenzeEmail.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    const caselle = await clicca(0);

    expect(utenti.aggiornaPreferenzeEmail).toHaveBeenCalledWith({ notifiche_email: false });
    expect(caselle[0].checked).toBe(true);
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'errore');
  });
});

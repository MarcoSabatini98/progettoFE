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

  async function cliccaDa(attive: boolean) {
    const fixture = TestBed.createComponent(PreferenzeEmailComponent);
    fixture.componentRef.setInput('attive', attive);
    await fixture.whenStable();
    const casella = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    casella.click();
    await fixture.whenStable();
    return casella;
  }

  it('salva subito la nuova scelta', async () => {
    utenti.aggiornaPreferenzeEmail.mockReturnValue(of({ notifiche_email: false }));

    const casella = await cliccaDa(true);

    expect(utenti.aggiornaPreferenzeEmail).toHaveBeenCalledWith(false);
    expect(casella.checked).toBe(false);
    expect(avvisi.mostra).toHaveBeenCalledWith('Salvato', 'successo');
  });

  it('se il salvataggio fallisce rimette la casella com’era', async () => {
    utenti.aggiornaPreferenzeEmail.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    const casella = await cliccaDa(false);

    expect(casella.checked).toBe(false);
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'errore');
  });
});

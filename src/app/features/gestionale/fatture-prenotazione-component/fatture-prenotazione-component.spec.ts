import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FattureService } from '../../../core/services/fatture/fatture-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { FatturePrenotazioneComponent } from './fatture-prenotazione-component';

describe('FatturePrenotazioneComponent', () => {
  const fatture = { elencaFatture: vi.fn(), creaBozza: vi.fn() };

  beforeEach(() => {
    Object.values(fatture).forEach((spia) => spia.mockReset());
    fatture.elencaFatture.mockReturnValue(
      of({ elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 }),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: FattureService, useValue: fatture },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(FatturePrenotazioneComponent);
    fixture.componentRef.setInput('prenotazioneId', 7);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const invia = async () => {
      elemento.querySelector<HTMLButtonElement>('.azioni button')!.click();
      await fixture.whenStable();
    };
    const altro = async () => {
      elemento.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
      await fixture.whenStable();
    };
    return { elemento, invia, altro };
  }

  it('elenca le fatture della prenotazione e crea la bozza intestata al titolare', async () => {
    fatture.creaBozza.mockReturnValue(of({ id: 30 }));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { elemento, invia } = await crea();

    expect(fatture.elencaFatture).toHaveBeenCalledWith({ prenotazione_id: 7 });
    expect(elemento.textContent).toContain('gestionale.fatture.nessunaPrenotazione');
    expect(elemento.querySelector('app-intestatario-fattura')).toBeNull();
    await invia();

    expect(fatture.creaBozza).toHaveBeenCalledWith(7, undefined);
    expect(naviga).toHaveBeenCalledWith(['/staff/fatture', 30]);
  });

  it('intestata a un altro manda solo i campi compilati', async () => {
    fatture.creaBozza.mockReturnValue(of({ id: 30 }));
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { elemento, invia, altro } = await crea();

    await altro();
    const denominazione = elemento.querySelector<HTMLInputElement>(
      '[formControlName=denominazione]',
    )!;
    denominazione.value = 'Acme Srl';
    denominazione.dispatchEvent(new Event('input'));
    await invia();

    expect(fatture.creaBozza).toHaveBeenCalledWith(7, {
      denominazione: 'Acme Srl',
      nazione: 'IT',
      codice_destinatario: '0000000',
    });
  });

  it('se non c’è nulla da fatturare lo spiega', async () => {
    fatture.creaBozza.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: { errore: { messaggio: 'Niente da fatturare' } },
          }),
      ),
    );
    const { elemento, invia } = await crea();

    await invia();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Niente da fatturare');
  });
});

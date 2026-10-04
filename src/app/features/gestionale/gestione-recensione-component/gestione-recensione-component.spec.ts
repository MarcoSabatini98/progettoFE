import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { RecensioneInterface } from '../../../shared/models/recensione/recensione-model';
import { GestioneRecensioneComponent } from './gestione-recensione-component';

describe('GestioneRecensioneComponent', () => {
  const recensioni = { moderaRecensione: vi.fn(), rispondi: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const recensione = {
    id: 9,
    stato: 'in_attesa',
    risposta: null,
  } as unknown as RecensioneInterface;

  beforeEach(() => {
    Object.values(recensioni).forEach((spia) => spia.mockReset());
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: RecensioniService, useValue: recensioni },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea(dati: Partial<RecensioneInterface> = {}) {
    const fixture = TestBed.createComponent(GestioneRecensioneComponent);
    fixture.componentRef.setInput('recensione', { ...recensione, ...dati });
    const salvata = vi.fn();
    fixture.componentInstance.salvata.subscribe(salvata);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const pulsante = (testo: string) =>
      [...elemento.querySelectorAll<HTMLButtonElement>('button')].find((voce) =>
        voce.textContent?.trim().endsWith(testo),
      );
    const rispondi = async (testo: string) => {
      const campo = elemento.querySelector('textarea')!;
      campo.value = testo;
      campo.dispatchEvent(new Event('input'));
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, elemento, salvata, pulsante, rispondi };
  }

  it('in attesa si può pubblicare o rifiutare', async () => {
    recensioni.moderaRecensione.mockReturnValue(of({ ...recensione, stato: 'pubblicata' }));
    const { fixture, salvata, pulsante } = await crea();

    expect(pulsante('gestionale.recensioni.azioni.rifiutata')).toBeDefined();
    pulsante('gestionale.recensioni.azioni.pubblicata')!.click();
    await fixture.whenStable();

    expect(recensioni.moderaRecensione).toHaveBeenCalledWith(9, 'pubblicata');
    expect(avvisi.mostra).toHaveBeenCalledWith(
      'gestionale.recensioni.esiti.pubblicata',
      'successo',
    );
    expect(salvata).toHaveBeenCalled();
  });

  it('una pubblicata si può solo rifiutare', async () => {
    const { pulsante } = await crea({ stato: 'pubblicata' });

    expect(pulsante('gestionale.recensioni.azioni.pubblicata')).toBeUndefined();
    expect(pulsante('gestionale.recensioni.azioni.rifiutata')).toBeDefined();
  });

  it('risponde, e la risposta vuota la toglie', async () => {
    recensioni.rispondi.mockReturnValue(of(recensione));
    const { rispondi } = await crea({ risposta: 'Grazie!' });

    await rispondi('  Grazie mille!  ');
    expect(recensioni.rispondi).toHaveBeenLastCalledWith(9, 'Grazie mille!');

    await rispondi('   ');
    expect(recensioni.rispondi).toHaveBeenLastCalledWith(9, null);
    expect(avvisi.mostra).toHaveBeenLastCalledWith(
      'gestionale.recensioni.esiti.rispostaTolta',
      'successo',
    );
  });

  it('la stessa risposta non chiama il backend', async () => {
    const { rispondi } = await crea({ risposta: 'Grazie!' });

    await rispondi('Grazie!');

    expect(recensioni.rispondi).not.toHaveBeenCalled();
  });

  it('mostra il motivo se il backend rifiuta', async () => {
    recensioni.rispondi.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: {} })),
    );
    const { elemento, rispondi } = await crea();

    await rispondi('Grazie');

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

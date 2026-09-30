import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import {
  PrenotazioneInterface,
  StatoPrenotazione,
} from '../../../shared/models/prenotazione/prenotazione-model';
import { MiePrenotazioniComponent } from './mie-prenotazioni-component';

describe('MiePrenotazioniComponent', () => {
  const prenotazioni = { elencaMie: vi.fn() };
  const prenotazione = (id: number, stato: StatoPrenotazione) =>
    ({
      id,
      stato,
      codice: `BB-${id}`,
      data_arrivo: '2030-07-01',
      data_partenza: '2030-07-04',
    }) as PrenotazioneInterface;
  const pagina = (numero: number, pagine: number, elementi: PrenotazioneInterface[]) =>
    of({ elementi, totale: 9, pagina: numero, perPagina: 12, pagine });

  beforeEach(() => {
    prenotazioni.elencaMie.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(MiePrenotazioniComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const codici = (indice: number) =>
      [...elemento.querySelectorAll('.griglia-schede')[indice].querySelectorAll('.codice')].map(
        (codice) => codice.textContent?.trim(),
      );
    return { fixture, elemento, codici };
  }

  it('mette prima le prossime dalla più vicina, poi lo storico, e porta al dettaglio', async () => {
    prenotazioni.elencaMie.mockReturnValue(
      pagina(1, 1, [
        prenotazione(3, 'confermata'),
        prenotazione(2, 'in_attesa'),
        prenotazione(1, 'conclusa'),
      ]),
    );

    const { elemento, codici } = await crea();

    expect(codici(0)).toEqual(['BB-2', 'BB-3']);
    expect(codici(1)).toEqual(['BB-1']);
    expect(elemento.querySelector('a.prenotazione')?.getAttribute('href')).toBe(
      '/area-personale/prenotazioni/2',
    );
    expect(elemento.querySelector('.altre')).toBeNull();
  });

  it('senza prenotazioni invita a prenotare', async () => {
    prenotazioni.elencaMie.mockReturnValue(pagina(1, 1, []));

    const { elemento } = await crea();

    expect(elemento.querySelector('.stato-vuoto a')?.getAttribute('href')).toBe('/prenota');
  });

  it('carica le pagine successive in coda', async () => {
    prenotazioni.elencaMie
      .mockReturnValueOnce(pagina(1, 2, [prenotazione(2, 'conclusa')]))
      .mockReturnValueOnce(pagina(2, 2, [prenotazione(1, 'cancellata')]));
    const { fixture, elemento, codici } = await crea();

    elemento.querySelector<HTMLButtonElement>('.altre')?.click();
    await fixture.whenStable();

    expect(prenotazioni.elencaMie).toHaveBeenLastCalledWith({ pagina: 2, perPagina: 12 });
    expect(codici(1)).toEqual(['BB-2', 'BB-1']);
  });

  it('se il caricamento fallisce lo dice', async () => {
    prenotazioni.elencaMie.mockReturnValue(throwError(() => new Error('rete')));

    const { elemento } = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
  });
});

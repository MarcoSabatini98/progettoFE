import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AlloggiatiService } from '../../../core/services/alloggiati/alloggiati-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { AlloggiatiComponent } from './alloggiati-component';

describe('AlloggiatiComponent', () => {
  const alloggiati = { elencaDaInviare: vi.fn(), scaricaFile: vi.fn(), leggiScheda: vi.fn() };
  const soggiorni = [
    { id: 7, codice: 'BB-7', data_arrivo: '2030-06-01', camera_id: 1 },
    { id: 8, codice: 'BB-8', data_arrivo: '2030-06-02', camera_id: 2 },
  ];

  beforeEach(() => {
    Object.values(alloggiati).forEach((spia) => spia.mockReset());
    alloggiati.elencaDaInviare.mockReturnValue(of(soggiorni));
    alloggiati.leggiScheda.mockReturnValue(of({ prenotazione: {}, completa: true, ospiti: [] }));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: AlloggiatiService, useValue: alloggiati },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  async function crea() {
    const fixture = TestBed.createComponent(AlloggiatiComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLElement>(selettore)!.click();
      await fixture.whenStable();
    };
    return { elemento, clicca };
  }

  it("scarica il file dei soggiorni scelti, all'inizio tutti", async () => {
    alloggiati.scaricaFile.mockReturnValue(of(new Blob(['riga'])));
    // Il router usa ancora URL: si aggiungono solo i metodi del download, che jsdom non ha.
    const indirizzi = Object.assign(class extends URL {}, {
      createObjectURL: () => 'blob:file',
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal('URL', indirizzi);
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { clicca } = await crea();

    await clicca('.soggiorno:last-child input[type=checkbox]');
    await clicca('.azioni button');

    expect(alloggiati.scaricaFile).toHaveBeenCalledWith([7]);
    const link = clic.mock.contexts.at(-1) as HTMLAnchorElement;
    expect(link.download).toMatch(/^alloggiati_\d{4}-\d{2}-\d{2}\.txt$/);
  });

  it('apre le schedine di un soggiorno, con il link alla prenotazione', async () => {
    const { elemento, clicca } = await crea();
    expect(elemento.querySelector('.soggiorno a')?.getAttribute('href')).toBe(
      '/staff/prenotazioni/7',
    );
    expect(elemento.querySelector('app-schedine-alloggiati')).toBeNull();

    await clicca('.soggiorno button');

    expect(alloggiati.leggiScheda).toHaveBeenCalledWith(7);
    expect(elemento.querySelector('.soggiorno button')?.getAttribute('aria-expanded')).toBe('true');
  });

  it('se mancano dati agli ospiti il file viene rifiutato e lo spiega', async () => {
    alloggiati.scaricaFile.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: {
              errore: { codice: 'DATI_ALLOGGIATI_INCOMPLETI', messaggio: 'Completa i dati' },
            },
          }),
      ),
    );
    const { elemento, clicca } = await crea();

    await clicca('.azioni button');

    expect(alloggiati.scaricaFile).toHaveBeenCalledWith([7, 8]);
    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Completa i dati');
  });

  it('senza soggiorni da inviare non propone il file', async () => {
    alloggiati.elencaDaInviare.mockReturnValue(of([]));
    const { elemento } = await crea();

    expect(elemento.querySelector('.stato-vuoto')).not.toBeNull();
    expect(elemento.querySelector('.azioni')).toBeNull();
  });
});

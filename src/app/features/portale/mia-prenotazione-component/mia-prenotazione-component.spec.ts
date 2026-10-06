import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import {
  PrenotazioneInterface,
  StatoPrenotazione,
} from '../../../shared/models/prenotazione/prenotazione-model';
import { RiepilogoPagamentoInterface } from '../../../shared/models/riepilogo-pagamento/riepilogo-pagamento-model';
import { MiaPrenotazioneComponent } from './mia-prenotazione-component';

describe('MiaPrenotazioneComponent', () => {
  const prenotazioni = {
    leggiPrenotazione: vi.fn(),
    anteprimaCancellazione: vi.fn(),
    cancellaPrenotazione: vi.fn(),
  };
  const pagamenti = { leggiRiepilogo: vi.fn(), avviaOnline: vi.fn() };
  const recensioni = { creaRecensione: vi.fn() };
  const prenotazione = (stato: StatoPrenotazione) =>
    ({
      id: 7,
      codice: 'BB-7',
      stato,
      data_arrivo: '2030-07-01',
      data_partenza: '2030-07-04',
      righe_servizi: [],
    }) as unknown as PrenotazioneInterface;
  const riepilogo = {
    dovuto: 300,
    incassato: 300,
    rimborsato: 0,
    saldo: 0,
    acconto_richiesto: 90,
    da_pagare_ora: 0,
    metodi_online: ['stripe'],
    bonifico: null,
  } as unknown as RiepilogoPagamentoInterface;

  beforeEach(() => {
    [
      ...Object.values(prenotazioni),
      ...Object.values(pagamenti),
      recensioni.creaRecensione,
    ].forEach((spia) => spia.mockReset());
    pagamenti.leggiRiepilogo.mockReturnValue(of(riepilogo));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: PagamentiService, useValue: pagamenti },
        { provide: RecensioniService, useValue: recensioni },
        { provide: CamereService, useValue: { elencaExtraPubblici: () => of([]) } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(stato: StatoPrenotazione) {
    prenotazioni.leggiPrenotazione.mockReturnValue(of(prenotazione(stato)));
    const fixture = TestBed.createComponent(MiaPrenotazioneComponent);
    fixture.componentRef.setInput('id', '7');
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLElement>(selettore)?.click();
      await fixture.whenStable();
    };
    return { elemento, clicca };
  }

  it('legge la prenotazione e il conto come cliente', async () => {
    const { elemento } = await crea('confermata');

    expect(prenotazioni.leggiPrenotazione).toHaveBeenCalledWith(7, true);
    expect(pagamenti.leggiRiepilogo).toHaveBeenCalledWith(7, true);
    expect(elemento.querySelector('.indietro')?.getAttribute('href')).toBe(
      '/area-personale/prenotazioni',
    );
    expect(elemento.querySelector('.stato-prenotazione')?.textContent).toContain(
      'prenotazione.stati.confermata',
    );
  });

  it('confermata: si cancella e poi si rilegge', async () => {
    prenotazioni.anteprimaCancellazione.mockReturnValue(
      of({ penale: 0, gratuita_fino_al: null, incassato: 0 }),
    );
    prenotazioni.cancellaPrenotazione.mockReturnValue(of({}));
    const { elemento, clicca } = await crea('confermata');

    expect(elemento.querySelector('app-modulo-recensione')).toBeNull();
    await clicca('app-cancella-prenotazione button');
    await clicca('app-cancella-prenotazione [type="submit"]');

    expect(prenotazioni.cancellaPrenotazione).toHaveBeenCalledWith(7, { motivo: null }, true);
    expect(prenotazioni.leggiPrenotazione).toHaveBeenCalledTimes(2);
  });

  it('conclusa: niente cancellazione, si recensisce la propria prenotazione', async () => {
    recensioni.creaRecensione.mockReturnValue(of({}));
    const { elemento, clicca } = await crea('conclusa');

    expect(elemento.querySelector('app-cancella-prenotazione')).toBeNull();
    await clicca('.stelle label:nth-of-type(4) input');
    await clicca('app-modulo-recensione [type="submit"]');

    expect(recensioni.creaRecensione).toHaveBeenCalledWith(7, expect.objectContaining({ voto: 4 }));
  });

  it('in attesa: paga online a nome del cliente', async () => {
    pagamenti.leggiRiepilogo.mockReturnValue(of({ ...riepilogo, saldo: 300, da_pagare_ora: 90 }));
    pagamenti.avviaOnline.mockReturnValue(of({ url: '#pagamento' }));
    const { clicca } = await crea('in_attesa');

    await clicca('.paga');

    expect(pagamenti.avviaOnline).toHaveBeenCalledWith(7, { metodo: 'stripe', importo: 90 }, true);
  });

  it('prenotazione di altri: spiega perché non si apre', async () => {
    prenotazioni.leggiPrenotazione.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { errore: { codice: 'PRENOTAZIONE_ALTRUI', messaggio: 'Non è tua' } },
          }),
      ),
    );
    const fixture = TestBed.createComponent(MiaPrenotazioneComponent);
    fixture.componentRef.setInput('id', '8');
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('Non è tua');
  });
});

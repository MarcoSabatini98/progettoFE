import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { RegistroService } from '../../../core/services/registro/registro-service';
import { SchedaPrenotazioneComponent } from './scheda-prenotazione-component';

describe('SchedaPrenotazioneComponent', () => {
  const prenotazioni = { leggiPrenotazione: vi.fn() };
  const auth = { haPermessi: vi.fn(), haRuolo: vi.fn() };
  const prenotazione = {
    id: 7,
    codice: 'BB-7',
    stato: 'confermata',
    canale: 'telefono',
    data_arrivo: '2030-06-01',
    data_partenza: '2030-06-03',
    adulti: 2,
    bambini: 0,
    creato_il: '2030-05-01T10:00:00.000Z',
    ora_arrivo_prevista: '15:30:00',
    note_interne: 'Cliente abituale',
    titolare: { nome: 'Anna', cognome: 'Rossi', email: 'anna@example.com', lingua: 'it' },
    righe_servizi: [],
  };

  beforeEach(() => {
    prenotazioni.leggiPrenotazione.mockReset();
    prenotazioni.leggiPrenotazione.mockReturnValue(of(prenotazione));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: AuthService, useValue: auth },
        {
          provide: RegistroService,
          useValue: {
            leggiStoria: () => of({ elementi: [], totale: 0, pagina: 1, perPagina: 10, pagine: 0 }),
          },
        },
        {
          provide: PagamentiService,
          useValue: {
            elencaPagamentiPrenotazione: () => of([]),
            leggiRiepilogo: () => of({ da_pagare_ora: 0, metodi_online: [] }),
          },
        },
        {
          provide: CamereService,
          useValue: { elencaServizi: () => of([]), elencaCamere: () => of([]) },
        },
        {
          provide: FattureService,
          useValue: {
            elencaFatture: () =>
              of({ elementi: [], totale: 0, pagina: 1, perPagina: 20, pagine: 0 }),
          },
        },
        { provide: OspitiService, useValue: { elencaOspitiPrenotazione: () => of([]) } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(permesso: boolean) {
    auth.haPermessi.mockReturnValue(permesso);
    auth.haRuolo.mockReturnValue(permesso);
    const fixture = TestBed.createComponent(SchedaPrenotazioneComponent);
    fixture.componentRef.setInput('id', '7');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra i dati di gestione della prenotazione', async () => {
    const elemento = await crea(true);

    expect(prenotazioni.leggiPrenotazione).toHaveBeenCalledWith(7);
    expect(elemento.querySelector('h1')?.textContent).toContain('prenotazione.titolo');
    expect(elemento.textContent).toContain('Rossi Anna');
    expect(elemento.textContent).toContain('15:30');
    expect(elemento.textContent).toContain('Cliente abituale');
  });

  it('con i permessi propone modifica, ospiti, incassi, fatture, link di check-in, cancellazione e (admin) storia', async () => {
    const elemento = await crea(true);

    for (const selettore of [
      'app-modifica-prenotazione',
      'app-incassi-prenotazione',
      'app-fatture-prenotazione',
      'app-ospiti-soggiorno',
      'app-link-checkin',
      'app-cancella-prenotazione',
      'app-storia-record',
    ]) {
      expect(elemento.querySelector(selettore)).not.toBeNull();
    }
  });

  it('senza permessi resta in sola lettura', async () => {
    const elemento = await crea(false);

    for (const selettore of [
      'app-modifica-prenotazione',
      'app-incassi-prenotazione',
      'app-fatture-prenotazione',
      'app-ospiti-soggiorno',
      'app-link-checkin',
      'app-cancella-prenotazione',
      'app-storia-record',
    ]) {
      expect(elemento.querySelector(selettore)).toBeNull();
    }
  });
});

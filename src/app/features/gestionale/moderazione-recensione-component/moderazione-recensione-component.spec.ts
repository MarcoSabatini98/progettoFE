import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { ModerazioneRecensioneComponent } from './moderazione-recensione-component';

describe('ModerazioneRecensioneComponent', () => {
  const recensioni = { leggiRecensione: vi.fn(), moderaRecensione: vi.fn(), rispondi: vi.fn() };
  const recensione = {
    id: 9,
    voto: 2,
    voto_pulizia: 1,
    voto_personale: null,
    voto_posizione: 4,
    voto_comfort: null,
    voto_qualita_prezzo: null,
    titolo: 'Rumorosa',
    commento: 'Camera sulla strada.',
    lingua: 'it',
    anonima: true,
    stato: 'pubblicata',
    moderata_il: '2030-06-03T09:00:00Z',
    risposta: null,
    creato_il: '2030-06-02T08:00:00Z',
    ospite: { nome: 'Anna', cognome: 'Bianchi', paese: null },
    prenotazione: {
      id: 31,
      codice: 'BB-123',
      data_arrivo: '2030-05-28',
      data_partenza: '2030-06-01',
    },
    moderatore: { nome: 'Luca', cognome: 'Neri' },
  };

  beforeEach(() => {
    Object.values(recensioni).forEach((spia) => spia.mockReset());
    recensioni.leggiRecensione.mockReturnValue(of(recensione));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: RecensioniService, useValue: recensioni },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ModerazioneRecensioneComponent);
    fixture.componentRef.setInput('id', '9');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra la recensione con prenotazione, voti dati e moderatore', async () => {
    const elemento = await crea();

    expect(recensioni.leggiRecensione).toHaveBeenCalledWith(9);
    expect(elemento.querySelector('h1')?.textContent).toContain('Rumorosa');
    expect(elemento.querySelector('.occhiello')?.textContent).toContain('Anna Bianchi');
    expect(elemento.querySelector('.dati a')?.getAttribute('href')).toBe('/staff/prenotazioni/31');
    const voti = [...elemento.querySelectorAll('.dati dt')].map((voce) => voce.textContent?.trim());
    expect(voti).toContain('recensioni.categorie.media_pulizia');
    expect(voti).toContain('recensioni.categorie.media_posizione');
    expect(voti).not.toContain('recensioni.categorie.media_comfort');
    expect(elemento.textContent).toContain('Luca Neri');
    expect(elemento.textContent).toContain('Camera sulla strada.');
    expect(elemento.textContent).toContain('gestionale.recensioni.anonima');
    expect(elemento.querySelector('app-gestione-recensione')).not.toBeNull();
  });

  it('mostra l errore se la recensione non è accessibile', async () => {
    recensioni.leggiRecensione.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: {} })),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

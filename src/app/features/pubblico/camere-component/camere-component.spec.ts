import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ServizioInterface } from '../../../shared/models/servizio/servizio-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { CamereComponent } from './camere-component';

describe('CamereComponent', () => {
  const camere = { elencaTipologiePubbliche: vi.fn(), elencaExtraPubblici: vi.fn() };
  const tipologia = {
    id: 1,
    nome: 'Doppia',
    slug: 'doppia',
    prezzo_base: 90,
    ospiti_max: 2,
  } as TipologiaCameraInterface;
  const colazione = {
    id: 3,
    nome: 'Colazione',
    icona: null,
    prezzo: 12,
    calcolo_prezzo: 'a_persona_notte',
  } as ServizioInterface;

  beforeEach(() => {
    camere.elencaTipologiePubbliche.mockReturnValue(of([tipologia]));
    camere.elencaExtraPubblici.mockReturnValue(of([colazione]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(CamereComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra le tipologie e gli extra con il modo di calcolo del prezzo', async () => {
    const elemento = await crea();

    expect(elemento.querySelectorAll('app-scheda-tipologia')).toHaveLength(1);
    expect(elemento.querySelector('.servizio h3')?.textContent).toBe('Colazione');
    expect(elemento.querySelector('.servizio-prezzo')?.textContent).toContain(
      'camere.calcolo.a_persona_notte',
    );
  });

  it('senza tipologie né extra lo dice e nasconde la sezione extra', async () => {
    camere.elencaTipologiePubbliche.mockReturnValue(of([]));
    camere.elencaExtraPubblici.mockReturnValue(of([]));

    const elemento = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('camere.nessuna');
    expect(elemento.querySelector('.servizio')).toBeNull();
  });

  it('elenca una volta le dotazioni comuni a tutte le tipologie', async () => {
    const wifi = { id: 5, nome: 'Wi-Fi' };
    camere.elencaTipologiePubbliche.mockReturnValue(
      of([
        { ...tipologia, servizi: [wifi, { id: 6, nome: 'Balcone' }] },
        { ...tipologia, id: 2, servizi: [{ id: 7, nome: 'Vasca' }, wifi] },
      ]),
    );

    const elemento = await crea();

    const comuni = elemento.querySelectorAll('.pillole li');
    expect(comuni).toHaveLength(1);
    expect(comuni[0].textContent).toContain('Wi-Fi');
  });

  it('chiude invitando a prenotare o a scrivere', async () => {
    const elemento = await crea();

    const link = [...elemento.querySelectorAll('.chiusura a')].map((a) => a.getAttribute('href'));
    expect(link).toEqual(['/prenota', '/contatti']);
    expect(elemento.querySelector('.pillole')).toBeNull();
  });

  it('se il backend non risponde mostra un errore', async () => {
    camere.elencaTipologiePubbliche.mockReturnValue(throwError(() => new Error('500')));

    const elemento = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
  });
});

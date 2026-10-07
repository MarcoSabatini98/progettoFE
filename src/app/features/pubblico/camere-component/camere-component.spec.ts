import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PaginaSitoInterface } from '../../../shared/models/pagina-sito/pagina-sito-model';
import { ServizioInterface } from '../../../shared/models/servizio/servizio-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { CamereComponent } from './camere-component';

describe('CamereComponent', () => {
  const camere = { elencaTipologiePubbliche: vi.fn(), elencaExtraPubblici: vi.fn() };
  const contenuti = { leggiPaginaPubblica: vi.fn() };
  const tipologia = {
    id: 1,
    nome: 'Doppia',
    slug: 'doppia',
    descrizione: 'Vista sul golfo.',
    servizi: [{ id: 5, nome: 'Wi-Fi', icona: 'wifi' }],
    media: [],
  } as unknown as TipologiaCameraInterface;
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
    contenuti.leggiPaginaPubblica.mockReturnValue(
      of({
        descrizione: 'Dormire sul mare',
        testo: 'Ogni camera guarda il golfo.',
        media: [{ percorso: 'media/camere.webp' }],
      } as PaginaSitoInterface),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ camere: { titolo: 'Le camere', introduzione: 'Scegli' } })],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'en' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(CamereComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('copertina e paragrafo vengono dai contenuti della pagina camere', async () => {
    const elemento = await crea();

    expect(contenuti.leggiPaginaPubblica).toHaveBeenCalledWith('camere', 'en');
    expect(elemento.querySelector('.copertina-schermo .sfondo')).not.toBeNull();
    expect(elemento.querySelector('h1')?.textContent).toBe('Le camere');
    expect(elemento.querySelector('.introduzione')?.textContent).toBe('Dormire sul mare');
    expect(elemento.querySelector('.paragrafo')?.textContent).toBe('Ogni camera guarda il golfo.');
  });

  it('senza contenuti resta il sottotitolo predefinito e niente paragrafo', async () => {
    contenuti.leggiPaginaPubblica.mockReturnValue(of({ descrizione: null, testo: null }));

    const elemento = await crea();

    expect(elemento.querySelector('.introduzione')?.textContent).toBe('Scegli');
    expect(elemento.querySelector('.paragrafo')).toBeNull();
  });

  it('un riquadro per tipologia, con dotazioni e il link alle sue camere', async () => {
    const elemento = await crea();

    const riquadri = elemento.querySelectorAll('app-riquadro-camera');
    expect(riquadri).toHaveLength(1);
    expect(riquadri[0].querySelector('h2')?.textContent).toBe('Doppia');
    expect(riquadri[0].querySelector('.descrizione')?.textContent).toBe('Vista sul golfo.');
    expect(riquadri[0].querySelector('.dotazioni li')?.textContent).toContain('Wi-Fi');
    expect(riquadri[0].querySelector('.azioni a')?.getAttribute('href')).toBe('/camere/doppia');
  });

  it('gli extra in fondo, con il modo di calcolo del prezzo', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('.griglia-extra h3')?.textContent).toBe('Colazione');
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

  it('se il backend non risponde mostra un errore', async () => {
    camere.elencaTipologiePubbliche.mockReturnValue(throwError(() => new Error('500')));

    const elemento = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
  });
});

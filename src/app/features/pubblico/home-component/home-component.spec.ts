import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { RecensionePubblicaInterface } from '../../../shared/models/recensione/recensione-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { HomeComponent } from './home-component';

describe('HomeComponent', () => {
  const camere = { elencaTipologiePubbliche: vi.fn() };
  const contenuti = { elencaMedia: vi.fn() };
  const recensioni = { leggiValutazioni: vi.fn(), elencaPubbliche: vi.fn() };
  const foto = (entita: string) =>
    [{ id: 1, percorso: `${entita}.jpg`, testo_alternativo: entita }] as MediaInterface[];
  const tipologia = (id: number) =>
    ({ id, nome: `Camera ${id}`, slug: `camera-${id}` }) as TipologiaCameraInterface;

  beforeEach(() => {
    camere.elencaTipologiePubbliche.mockReturnValue(of([1, 2, 3, 4].map(tipologia)));
    contenuti.elencaMedia.mockImplementation(({ entita }) => of(foto(entita)));
    recensioni.leggiValutazioni.mockReturnValue(of({ media: '4.50', numero_recensioni: 8 }));
    recensioni.elencaPubbliche.mockReturnValue(
      of({ elementi: [{ id: 1, voto: 5 } as RecensionePubblicaInterface], pagina: 1, pagine: 3 }),
    );
  });

  async function crea(impostazioni: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: ContenutiService, useValue: contenuti },
        { provide: RecensioniService, useValue: recensioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        {
          provide: ImpostazioniService,
          useValue: { testo: (chiave: string) => impostazioni[chiave] ?? '' },
        },
      ],
    });
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra nome, località e orari della struttura', async () => {
    const elemento = await crea({
      [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare',
      [CHIAVI_IMPOSTAZIONI.comune]: 'Alghero',
      [CHIAVI_IMPOSTAZIONI.orarioCheckin]: '15:00',
      [CHIAVI_IMPOSTAZIONI.orarioCheckout]: '10:30',
    });

    expect(elemento.querySelector('h1')?.textContent).toBe('Casa del Mare');
    expect(elemento.querySelector('.luogo')?.textContent).toContain('Alghero');
    expect([...elemento.querySelectorAll('.orari dd')].map((dd) => dd.textContent)).toEqual([
      '15:00',
      '10:30',
    ]);
  });

  it('senza orari non mostra il riquadro', async () => {
    const elemento = await crea({ [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare' });

    expect(elemento.querySelector('.orari')).toBeNull();
  });

  it('mette la foto della home nell’arco e quelle della struttura in galleria', async () => {
    const elemento = await crea({});

    expect(elemento.querySelector('.arco img')?.getAttribute('alt')).toBe('home');
    expect(elemento.querySelector('app-galleria img')?.getAttribute('alt')).toBe('struttura');
  });

  it('mostra in anteprima tre tipologie e le ultime recensioni con la media', async () => {
    const elemento = await crea({});

    expect(elemento.querySelectorAll('app-scheda-tipologia')).toHaveLength(3);
    expect(recensioni.elencaPubbliche).toHaveBeenCalledWith({ pagina: 1, perPagina: 3 });
    expect(elemento.querySelectorAll('app-scheda-recensione')).toHaveLength(1);
    expect(elemento.querySelector('.media')?.textContent).toContain('home.media');
    expect([...elemento.querySelectorAll('a.tutte')].map((a) => a.getAttribute('href'))).toEqual([
      '/camere',
      '/recensioni',
    ]);
  });

  it('senza foto, camere e recensioni mostra solo la copertina', async () => {
    contenuti.elencaMedia.mockReturnValue(of([]));
    camere.elencaTipologiePubbliche.mockReturnValue(of([]));
    recensioni.elencaPubbliche.mockReturnValue(of({ elementi: [], pagina: 1, pagine: 0 }));

    const elemento = await crea({});

    expect(elemento.querySelector('.arco img')).toBeNull();
    expect(elemento.querySelectorAll('.sezione')).toHaveLength(0);
  });
});

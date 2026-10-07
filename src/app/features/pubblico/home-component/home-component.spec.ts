import { signal } from '@angular/core';
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
import { TemaService } from '../../../core/services/tema/tema-service';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { RecensionePubblicaInterface } from '../../../shared/models/recensione/recensione-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { HomeComponent } from './home-component';

describe('HomeComponent', () => {
  const camere = { elencaTipologiePubbliche: vi.fn() };
  const contenuti = { elencaMedia: vi.fn(), leggiPaginaPubblica: vi.fn() };
  const recensioni = { leggiValutazioni: vi.fn(), elencaPubbliche: vi.fn() };
  const scuro = signal(false);
  const foto = (entita: string) =>
    [
      { id: 1, percorso: `${entita}.jpg`, tipo_mime: 'image/jpeg', testo_alternativo: entita },
    ] as MediaInterface[];
  const tipologia = (id: number) =>
    ({ id, nome: `Camera ${id}`, slug: `camera-${id}` }) as TipologiaCameraInterface;

  beforeEach(() => {
    scuro.set(false);
    camere.elencaTipologiePubbliche.mockReturnValue(of([1, 2, 3, 4].map(tipologia)));
    contenuti.elencaMedia.mockImplementation(({ entita }) => of(foto(entita)));
    contenuti.leggiPaginaPubblica.mockReturnValue(
      of({ sezioni: [{ id: 1, titolo: 'Colazione in terrazza', testo: 'Dolci fatti in casa' }] }),
    );
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
        { provide: TemaService, useValue: { scuro } },
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
    expect(elemento.querySelector('a.prenota')?.getAttribute('href')).toBe('/prenota');
    expect([...elemento.querySelectorAll('.orari dd')].map((dd) => dd.textContent)).toEqual([
      '15:00',
      '10:30',
    ]);
  });

  it('senza orari non mostra il riquadro', async () => {
    const elemento = await crea({ [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare' });

    expect(elemento.querySelector('.orari')).toBeNull();
  });

  it('mette la foto della home come sfondo decorativo e quelle della struttura in galleria', async () => {
    const elemento = await crea({});

    const sfondo = elemento.querySelector('img.sfondo');
    expect(sfondo?.getAttribute('src')).toContain('home.jpg');
    expect(sfondo?.getAttribute('alt')).toBe('');
    expect(elemento.querySelector('.pausa')).toBeNull();
    expect(elemento.querySelector('app-galleria img')?.getAttribute('alt')).toBe('struttura');
  });

  it('col tema scuro lo sfondo scuro, se manca quello chiaro', async () => {
    scuro.set(true);
    const elemento = await crea({});
    const sfondo = () => elemento.querySelector('img.sfondo')?.getAttribute('src');
    expect(sfondo()).toContain('home_scuro.jpg');

    scuro.set(false);
    TestBed.tick();
    expect(sfondo()).toContain('home.jpg');

    TestBed.resetTestingModule();
    contenuti.elencaMedia.mockImplementation(({ entita }) =>
      of(entita === 'home_scuro' ? [] : foto(entita)),
    );
    scuro.set(true);
    const senzaScuro = await crea({});
    expect(senzaScuro.querySelector('img.sfondo')?.getAttribute('src')).toContain('home.jpg');
  });

  it("nell'arco il logo della struttura, senza logo le iniziali del nome", async () => {
    const elemento = await crea({ [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare' });
    expect(elemento.querySelector('.arco-iniziali')?.textContent).toBe('CD');
    expect(elemento.querySelector('.arco img')).toBeNull();

    TestBed.resetTestingModule();
    const conLogo = await crea({ [CHIAVI_IMPOSTAZIONI.logo]: 'media/logo.png' });
    expect(conLogo.querySelector('.arco-logo img')?.getAttribute('src')).toContain(
      'media/logo.png',
    );
    expect(conLogo.querySelector('.arco-iniziali')).toBeNull();
  });

  it('un video di sfondo parte muto e si può mettere in pausa', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    contenuti.elencaMedia.mockImplementation(({ entita }) =>
      of(entita === 'home' ? [{ id: 2, percorso: 'v.mp4', tipo_mime: 'video/mp4' }] : []),
    );
    const elemento = await crea({});
    const video = elemento.querySelector<HTMLVideoElement>('video.sfondo')!;
    const pulsante = elemento.querySelector<HTMLButtonElement>('.pausa')!;

    expect(video.muted).toBe(true);
    expect(pulsante.getAttribute('aria-label')).toBe('home.video.riproduci');
    pulsante.click();
    expect(play).toHaveBeenCalled();

    video.dispatchEvent(new Event('play'));
    await new Promise((fine) => setTimeout(fine));
    TestBed.tick();
    expect(pulsante.getAttribute('aria-label')).toBe('home.video.pausa');
    play.mockRestore();
  });

  it('mostra tutte le tipologie nel carosello e le ultime recensioni con la media', async () => {
    const elemento = await crea({});

    expect(elemento.querySelectorAll('app-carosello app-scheda-tipologia')).toHaveLength(4);
    expect(recensioni.elencaPubbliche).toHaveBeenCalledWith({ pagina: 1, perPagina: 3 });
    expect(elemento.querySelectorAll('app-scheda-recensione')).toHaveLength(1);
    expect(elemento.querySelector('.media')?.textContent).toContain('home.media');
    expect([...elemento.querySelectorAll('a.tutte')].map((a) => a.getAttribute('href'))).toEqual([
      '/camere',
      '/recensioni',
    ]);
  });

  it('in fondo le sezioni della home scritte dallo staff, nella lingua del sito', async () => {
    const elemento = await crea({});

    expect(contenuti.leggiPaginaPubblica).toHaveBeenCalledWith('home', 'it');
    expect(elemento.querySelector('app-sezioni h2')?.textContent).toBe('Colazione in terrazza');
  });

  it('senza foto, camere e recensioni mostra solo la copertina', async () => {
    contenuti.elencaMedia.mockReturnValue(of([]));
    camere.elencaTipologiePubbliche.mockReturnValue(of([]));
    recensioni.elencaPubbliche.mockReturnValue(of({ elementi: [], pagina: 1, pagine: 0 }));

    const elemento = await crea({});

    expect(elemento.querySelector('.sfondo')).toBeNull();
    expect(elemento.querySelectorAll('.sezione')).toHaveLength(0);
  });
});

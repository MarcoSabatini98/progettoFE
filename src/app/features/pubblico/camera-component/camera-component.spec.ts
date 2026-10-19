import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CameraComponent } from './camera-component';

describe('CameraComponent', () => {
  const camere = { leggiTipologiaPubblica: vi.fn(), elencaExtraPubblici: () => of([]) };
  const foto = (id: number) => ({ id, percorso: `${id}.jpg`, testo_alternativo: `Foto ${id}` });
  const camera = (id: number, numero: string, media = [foto(id * 10)]) => ({
    id,
    numero,
    nome: null,
    piano: 1,
    ospiti_max: null,
    servizi: [],
    media,
  });
  const tipologia = {
    id: 1,
    nome: 'Doppia',
    slug: 'doppia',
    prezzo_base: 95,
    ospiti_max: 2,
    media: [foto(1), foto(2)],
    servizi: Array.from({ length: 8 }, (_, indice) => ({
      id: indice + 1,
      nome: `Dotazione ${indice + 1}`,
      icona: null,
    })),
    camere: [
      camera(2, '102'),
      camera(3, '103', [foto(31), foto(32), foto(33)]),
      camera(5, '201', []),
    ],
  };

  beforeEach(() => {
    camere.leggiTipologiaPubblica.mockReset();
    camere.leggiTipologiaPubblica.mockReturnValue(of(tipologia));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
        {
          provide: TariffeService,
          useValue: { leggiCondizioniSoggiorno: () => of({ piani: [], tassa: null }) },
        },
      ],
    });
  });

  async function crea(numero: string) {
    const fixture = TestBed.createComponent(CameraComponent);
    fixture.componentRef.setInput('slug', 'doppia');
    fixture.componentRef.setInput('numero', numero);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  const principale = (elemento: HTMLElement) =>
    elemento.querySelector('img.principale')?.getAttribute('alt');

  it('una sola foto propria: nessuna miniatura', async () => {
    const { elemento } = await crea('102');

    expect(camere.leggiTipologiaPubblica).toHaveBeenCalledWith('doppia');
    expect(elemento.querySelector('h1')?.textContent).toContain('camera.numero');
    expect(principale(elemento)).toBe('Foto 20');
    expect(elemento.querySelector('.miniature')).toBeNull();
  });

  it('più foto: le miniature cambiano la foto grande', async () => {
    const { fixture, elemento } = await crea('103');

    const miniature = elemento.querySelectorAll<HTMLButtonElement>('.miniatura');
    expect(miniature).toHaveLength(3);
    expect(miniature[0].getAttribute('aria-pressed')).toBe('true');

    miniature[2].click();
    await fixture.whenStable();

    expect(principale(elemento)).toBe('Foto 33');
    expect(miniature[2].getAttribute('aria-pressed')).toBe('true');
  });

  it('senza foto proprie mostra quelle della tipologia', async () => {
    const { elemento } = await crea('201');

    expect(principale(elemento)).toBe('Foto 1');
    expect(elemento.querySelectorAll('.miniatura')).toHaveLength(2);
  });

  it('prenota proprio questa camera e porta alle altre della tipologia', async () => {
    const { elemento } = await crea('103');

    expect(elemento.querySelector('a.prenota')?.getAttribute('href')).toBe(
      '/prenota?tipologia=doppia&camera=103',
    );
    const altre = [...elemento.querySelectorAll('.altra a')].map((link) =>
      link.getAttribute('href'),
    );
    expect(altre).toEqual(['/camere/doppia/102', '/camere/doppia/201']);
  });

  it('sotto Prenota le prime dotazioni e il link a tutte le altre', async () => {
    const { elemento } = await crea('102');

    expect(elemento.querySelectorAll('.dotazioni-brevi li')).toHaveLength(6);
    expect(elemento.querySelector('.tutte-dotazioni')?.getAttribute('href')).toBe('/#dotazioni');
    expect(elemento.querySelectorAll('#dotazioni li')).toHaveLength(8);
  });

  it('numero o tipologia sconosciuti: non trovata, col link alla tipologia', async () => {
    const { elemento } = await crea('999');

    expect(elemento.querySelector('h1')?.textContent).toContain('camera.nonTrovata');
    expect(elemento.querySelector('a.indietro')?.getAttribute('href')).toBe('/camere/doppia');
  });

  it('se la tipologia non si legge lo dice', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(throwError(() => new Error('404')));

    const { elemento } = await crea('102');

    expect(elemento.querySelector('h1')?.textContent).toContain('camera.nonTrovata');
  });
});

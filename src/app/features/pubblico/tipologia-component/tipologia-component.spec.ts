import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { TipologiaComponent } from './tipologia-component';

describe('TipologiaComponent', () => {
  const camere = { leggiTipologiaPubblica: vi.fn() };
  const tipologia = {
    id: 1,
    nome: 'Doppia vista mare',
    slug: 'doppia-vista-mare',
    descrizione: 'Vista sul golfo.',
    media: [{ id: 1, percorso: 'doppia.jpg', testo_alternativo: 'Doppia' }],
    servizi: [{ id: 5, nome: 'Wi-Fi', icona: 'wifi' }],
    camere: [],
  } as unknown as TipologiaCameraInterface;

  beforeEach(() => {
    camere.leggiTipologiaPubblica.mockReset();
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          camera: { numero: 'Camera {{ numero }}', numeroNome: 'Camera {{ numero }} “{{ nome }}”' },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(TipologiaComponent);
    fixture.componentRef.setInput('slug', 'doppia-vista-mare');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('la copertina ha foto, nome e descrizione della tipologia', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(of(tipologia));

    const elemento = await crea();

    expect(camere.leggiTipologiaPubblica).toHaveBeenCalledWith('doppia-vista-mare');
    expect(elemento.querySelector('.copertina-schermo .sfondo')?.getAttribute('src')).toContain(
      'doppia.jpg',
    );
    expect(elemento.querySelector('h1')?.textContent).toBe('Doppia vista mare');
    expect(elemento.querySelector('.introduzione')?.textContent).toBe('Vista sul golfo.');
    expect(elemento.querySelector('.indietro')?.getAttribute('href')).toBe('/camere');
  });

  it('un riquadro per camera: numero, nome, dotazioni della tipologia, prenota e altre info', async () => {
    const camera = (id: number, numero: string, nome: string | null) => ({ id, numero, nome });
    camere.leggiTipologiaPubblica.mockReturnValue(
      of({ ...tipologia, camere: [camera(2, '101', 'La splendida'), camera(3, '102', null)] }),
    );

    const elemento = await crea();

    const riquadri = [...elemento.querySelectorAll('app-riquadro-camera')];
    expect(riquadri.map((voce) => voce.querySelector('h2')?.textContent)).toEqual([
      'Camera 101 “La splendida”',
      'Camera 102',
    ]);
    expect(riquadri[0].querySelector('.descrizione')).toBeNull();
    expect(riquadri[0].querySelector('.dotazioni li')?.textContent).toContain('Wi-Fi');
    const link = [...riquadri[0].querySelectorAll('.azioni a')].map((a) => a.getAttribute('href'));
    expect(link).toEqual([
      '/prenota?tipologia=doppia-vista-mare&camera=101',
      '/camere/doppia-vista-mare/101',
    ]);
  });

  it('senza camere lo dice', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(of(tipologia));

    const elemento = await crea();

    expect(elemento.querySelector('app-riquadro-camera')).toBeNull();
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
      'tipologia.nessunaCamera',
    );
  });

  it('con uno slug sconosciuto lo dice e riporta alle camere', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(throwError(() => new Error('404')));

    const elemento = await crea();

    expect(elemento.querySelector('h1')?.textContent).toContain('tipologia.nonTrovata');
    expect(elemento.querySelector('.pagina-intestazione a')?.getAttribute('href')).toBe('/camere');
  });
});

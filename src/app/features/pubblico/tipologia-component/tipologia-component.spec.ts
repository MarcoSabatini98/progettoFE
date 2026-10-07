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
    prezzo_base: 90,
    ospiti_max: 2,
    superficie_mq: null,
    letti: '1 matrimoniale',
    media: [],
    servizi: [{ id: 5, nome: 'Wi-Fi', icona: 'wifi' }],
  } as unknown as TipologiaCameraInterface;
  const foto = (id: number) => ({ id, percorso: `${id}.jpg`, testo_alternativo: `Foto ${id}` });

  beforeEach(() => {
    camere.leggiTipologiaPubblica.mockReset();
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
    const fixture = TestBed.createComponent(TipologiaComponent);
    fixture.componentRef.setInput('slug', 'doppia-vista-mare');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('legge la tipologia dallo slug e ne mostra dettagli e dotazioni', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(of(tipologia));

    const elemento = await crea();

    expect(camere.leggiTipologiaPubblica).toHaveBeenCalledWith('doppia-vista-mare');
    expect(elemento.querySelector('h1')?.textContent).toBe('Doppia vista mare');
    expect(elemento.querySelector('.descrizione')?.textContent).toBe('Vista sul golfo.');
    expect(elemento.querySelector('a.prenota')?.getAttribute('href')).toBe(
      '/prenota?tipologia=doppia-vista-mare',
    );
    expect(elemento.querySelectorAll('.dettagli dd')).toHaveLength(2);
    expect(elemento.querySelector('.dotazioni li')?.textContent).toContain('Wi-Fi');
    expect(elemento.querySelector('app-carosello')).toBeNull();
    expect(elemento.querySelector('app-scheda-tipologia')).toBeNull();
  });

  it('elenca le sue camere, ognuna col link alla propria pagina', async () => {
    const camera = (id: number, numero: string) => ({ id, numero, piano: 1, servizi: [] });
    camere.leggiTipologiaPubblica.mockReturnValue(
      of({ ...tipologia, camere: [camera(2, '102'), camera(3, '103')] }),
    );

    const elemento = await crea();

    const link = [...elemento.querySelectorAll('app-scheda-tipologia h3 a')];
    expect(link.map((voce) => voce.getAttribute('href'))).toEqual([
      '/camere/doppia-vista-mare/102',
      '/camere/doppia-vista-mare/103',
    ]);
  });

  it('più foto scorrono nel carosello', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(of({ ...tipologia, media: [foto(1), foto(2)] }));

    const elemento = await crea();

    expect(elemento.querySelectorAll('app-carosello img.foto')).toHaveLength(2);
    expect(elemento.querySelector('app-carosello .comandi')).not.toBeNull();
  });

  it('una foto sola resta ferma, senza comandi', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(of({ ...tipologia, media: [foto(1)] }));

    const elemento = await crea();

    expect(elemento.querySelector('app-carosello img.foto')?.getAttribute('alt')).toBe('Foto 1');
    expect(elemento.querySelector('app-carosello .comandi')).toBeNull();
  });

  it('con uno slug sconosciuto lo dice e riporta alle camere', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(throwError(() => new Error('404')));

    const elemento = await crea();

    expect(elemento.querySelector('h1')?.textContent).toContain('tipologia.nonTrovata');
    expect(elemento.querySelector('a.indietro')?.getAttribute('href')).toBe('/camere');
  });
});

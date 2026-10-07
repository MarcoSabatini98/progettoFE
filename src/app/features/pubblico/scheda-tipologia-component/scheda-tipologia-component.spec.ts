import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { SchedaTipologiaComponent } from './scheda-tipologia-component';

describe('SchedaTipologiaComponent', () => {
  const tipologia = {
    nome: 'Doppia vista mare',
    slug: 'doppia-vista-mare',
    prezzo_base: 90,
    ospiti_max: 2,
    superficie_mq: 22,
    media: [
      { percorso: 'media/doppia.webp', testo_alternativo: 'Camera doppia' } as MediaInterface,
    ],
  } as TipologiaCameraInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(valore: TipologiaCameraInterface) {
    const fixture = TestBed.createComponent(SchedaTipologiaComponent);
    fixture.componentRef.setInput('tipologia', valore);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('collega il dettaglio e usa la prima foto come copertina', async () => {
    const elemento = await crea(tipologia);

    expect(elemento.querySelector('h3 a')?.getAttribute('href')).toBe('/camere/doppia-vista-mare');
    expect(elemento.querySelector('img')?.getAttribute('src')).toContain('media/doppia.webp');
    expect(elemento.querySelector('img')?.getAttribute('alt')).toBe('Camera doppia');
    expect(elemento.querySelectorAll('.dettagli li')).toHaveLength(2);
  });

  it('senza foto né superficie mostra solo la cornice e gli ospiti', async () => {
    const elemento = await crea({ ...tipologia, media: [], superficie_mq: null });

    expect(elemento.querySelector('img')).toBeNull();
    expect(elemento.querySelectorAll('.dettagli li')).toHaveLength(1);
  });
});

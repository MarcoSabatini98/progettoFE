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
    expect(elemento.querySelector('a.prenota')?.getAttribute('href')).toBe('/prenota');
    expect(elemento.querySelectorAll('.dettagli dd')).toHaveLength(2);
    expect(elemento.querySelector('.dotazioni li')?.textContent).toContain('Wi-Fi');
    expect(elemento.querySelector('app-galleria')).toBeNull();
  });

  it('con uno slug sconosciuto lo dice e riporta alle camere', async () => {
    camere.leggiTipologiaPubblica.mockReturnValue(throwError(() => new Error('404')));

    const elemento = await crea();

    expect(elemento.querySelector('h1')?.textContent).toContain('tipologia.nonTrovata');
    expect(elemento.querySelector('a.indietro')?.getAttribute('href')).toBe('/camere');
  });
});

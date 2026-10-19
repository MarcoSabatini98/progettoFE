import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { SchedaTipologiaCameraComponent } from './scheda-tipologia-camera-component';

describe('SchedaTipologiaCameraComponent', () => {
  const camere = { leggiTipologia: vi.fn(), eliminaTipologia: vi.fn(), elencaServizi: vi.fn() };
  const auth = { haPermessi: vi.fn() };
  const doppia = {
    id: 2,
    nome: 'Doppia',
    slug: 'doppia',
    prezzo_base: 90,
    ospiti_max: 2,
    ordine: 0,
    attiva: true,
    media: [
      { id: 4, percorso: 'media/a.jpg', tipo_mime: 'image/jpeg', testo_alternativo: 'Letto' },
    ],
  };

  beforeEach(() => {
    Object.values(camere).forEach((spia) => spia.mockReset());
    camere.leggiTipologia.mockReturnValue(of(doppia));
    camere.elencaServizi.mockReturnValue(of([]));
    auth.haPermessi.mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: AuthService, useValue: auth },
        { provide: ContenutiService, useValue: {} },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SchedaTipologiaCameraComponent);
    fixture.componentRef.setInput('id', '2');
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (testo: string) => {
      [...elemento.querySelectorAll<HTMLButtonElement>('app-elimina button')]
        .find((pulsante) => pulsante.textContent?.includes(testo))!
        .click();
      await fixture.whenStable();
    };
    return { elemento, clicca };
  }

  it('mostra dati, foto e il link alla pagina sul sito', async () => {
    const { elemento } = await crea();

    expect(camere.leggiTipologia).toHaveBeenCalledWith(2);
    expect(elemento.querySelector('h1')?.textContent).toContain('Doppia');
    expect(elemento.querySelector('.introduzione')?.getAttribute('href')).toBe('/camere/doppia');
    expect(elemento.querySelectorAll('app-galleria-media img')).toHaveLength(1);
  });

  it('senza permessi sui contenuti non mostra le foto', async () => {
    auth.haPermessi.mockReturnValue(false);
    const { elemento } = await crea();

    expect(auth.haPermessi).toHaveBeenCalledWith(['contenuti.gestisci']);
    expect(elemento.querySelector('app-galleria-media')).toBeNull();
  });

  it("elimina dopo la conferma e torna all'elenco", async () => {
    camere.eliminaTipologia.mockReturnValue(of(null));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { clicca } = await crea();

    await clicca('gestionale.camere.eliminaTipologia');
    await clicca('gestionale.camere.conferma');

    expect(camere.eliminaTipologia).toHaveBeenCalledWith(2);
    expect(naviga).toHaveBeenCalledWith('/staff/camere');
  });
});

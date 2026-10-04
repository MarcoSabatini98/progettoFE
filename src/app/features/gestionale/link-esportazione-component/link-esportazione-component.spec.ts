import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinkEsportazioneComponent } from './link-esportazione-component';

describe('LinkEsportazioneComponent', () => {
  async function apri() {
    const calendari = {
      elencaLinkEsportazione: vi.fn(() =>
        of([
          {
            camera_id: 1,
            numero: '101',
            nome: null,
            url: 'https://bb.it/api/calendari/feed/a.ics',
          },
          { camera_id: 2, numero: '102', nome: 'Suite', url: null },
        ]),
      ),
    };
    const camere = { rigeneraTokenIcal: vi.fn(() => of({ id: 1 })) };
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: CalendariService, useValue: calendari },
        { provide: CamereService, useValue: camere },
      ],
    });
    const fixture = TestBed.createComponent(LinkEsportazioneComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const camera = (indice: number) => elemento.querySelectorAll('.camera')[indice];
    const clicca = async (indice: number, pulsante = ':scope > button') => {
      camera(indice).querySelector<HTMLButtonElement>(pulsante)!.click();
      await fixture.whenStable();
    };
    return { elemento, calendari, camere, camera, clicca };
  }

  it('una camera col link lo dà da copiare, una senza propone di crearlo', async () => {
    const { camera } = await apri();

    expect(camera(0).querySelector('app-link-copiabile input')).not.toBeNull();
    expect(camera(1).querySelector('app-link-copiabile')).toBeNull();
    expect(camera(1).textContent).toContain('gestionale.calendari.esporta.crea');
  });

  it('il link nuovo chiede conferma perché il vecchio smette di funzionare', async () => {
    const { calendari, camere, camera, clicca } = await apri();

    await clicca(0);
    expect(camere.rigeneraTokenIcal).not.toHaveBeenCalled();
    expect(camera(0).textContent).toContain('gestionale.calendari.esporta.avviso');

    await clicca(0, '.pulsante-pericolo');

    expect(camere.rigeneraTokenIcal).toHaveBeenCalledWith(1);
    expect(calendari.elencaLinkEsportazione).toHaveBeenCalledTimes(2);
    expect(camera(0).textContent).not.toContain('gestionale.calendari.esporta.avviso');
  });

  it('la camera senza link lo crea subito', async () => {
    const { camere, clicca } = await apri();

    await clicca(1);

    expect(camere.rigeneraTokenIcal).toHaveBeenCalledWith(2);
  });
});

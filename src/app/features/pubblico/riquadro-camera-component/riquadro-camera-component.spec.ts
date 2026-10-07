import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { MediaInterface } from '../../../shared/models/media/media-model';
import { ServizioInterface } from '../../../shared/models/servizio/servizio-model';
import { RiquadroCameraComponent } from './riquadro-camera-component';

@Component({
  imports: [RiquadroCameraComponent],
  template: `
    <app-riquadro-camera titolo="Doppia" [dotazioni]="dotazioni" [foto]="foto">
      <a class="prova" href="/camere/doppia">Guarda</a>
    </app-riquadro-camera>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OspiteComponent {
  foto?: MediaInterface;
  dotazioni = [
    { id: 1, nome: 'Wi-Fi', icona: 'wifi' },
    { id: 2, nome: 'Minibar', icona: null },
  ] as ServizioInterface[];
}

describe('RiquadroCameraComponent', () => {
  async function crea(foto?: MediaInterface) {
    const fixture = TestBed.createComponent(OspiteComponent);
    fixture.componentInstance.foto = foto;
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra titolo, tutte le dotazioni e i pulsanti passati da fuori', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('h2')?.textContent).toBe('Doppia');
    expect(elemento.querySelector('.descrizione')).toBeNull();
    const dotazioni = [...elemento.querySelectorAll('.dotazioni li')];
    expect(dotazioni.map((voce) => voce.textContent?.trim())).toEqual([
      expect.stringContaining('Wi-Fi'),
      expect.stringContaining('Minibar'),
    ]);
    expect(elemento.querySelector('.azioni .prova')?.getAttribute('href')).toBe('/camere/doppia');
  });

  it('senza foto lascia lo sfondo neutro, con la foto la mostra', async () => {
    expect((await crea()).querySelector('.foto img')).toBeNull();

    TestBed.resetTestingModule();
    const elemento = await crea({
      percorso: 'media/doppia.webp',
      testo_alternativo: 'Doppia',
    } as MediaInterface);
    expect(elemento.querySelector('.foto img')?.getAttribute('alt')).toBe('Doppia');
  });
});

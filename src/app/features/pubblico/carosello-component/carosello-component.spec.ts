import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { CaroselloComponent } from './carosello-component';

@Component({
  imports: [CaroselloComponent],
  template: `
    <app-carosello [elementi]="elementi()" etichetta="Camere">
      <ng-template let-nome>
        <p class="contenuto">{{ nome }}</p>
      </ng-template>
    </app-carosello>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OspiteComponent {
  readonly elementi = signal<string[]>([]);
}

describe('CaroselloComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  async function crea(elementi: string[]) {
    const fixture = TestBed.createComponent(OspiteComponent);
    fixture.componentInstance.elementi.set(elementi);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const attiva = () => elemento.querySelector('[data-posizione="0"]')?.textContent?.trim();
    const premi = async (tasto: string) => {
      elemento.querySelector('.palco')?.dispatchEvent(new KeyboardEvent('keydown', { key: tasto }));
      await fixture.whenStable();
    };
    const trascina = async (da: number, a: number) => {
      const palco = elemento.querySelector('.palco')!;
      palco.dispatchEvent(Object.assign(new Event('pointerdown'), { clientX: da }));
      palco.dispatchEvent(Object.assign(new Event('pointerup'), { clientX: a }));
      await fixture.whenStable();
    };
    const clic = async (selettore: string, indice = 0) => {
      elemento.querySelectorAll<HTMLElement>(selettore)[indice].click();
      await fixture.whenStable();
    };
    return { elemento, attiva, premi, trascina, clic };
  }

  it('mette la prima al centro, le vicine ai lati e rende inerti le slide non attive', async () => {
    const { elemento, attiva } = await crea(['A', 'B', 'C', 'D', 'E', 'F']);

    const slide = [...elemento.querySelectorAll('.slide')];
    expect(attiva()).toBe('A');
    expect(slide.map((voce) => voce.getAttribute('data-posizione'))).toEqual([
      '0',
      '1',
      '2',
      '-2',
      '-1',
    ]);
    expect(slide.filter((voce) => voce.hasAttribute('inert'))).toHaveLength(4);
    expect(elemento.querySelector('.palco')?.getAttribute('aria-label')).toBe('Camere');
  });

  it('con poche slide ognuna compare una volta sola', async () => {
    const { elemento } = await crea(['A', 'B']);

    expect(elemento.querySelectorAll('.slide')).toHaveLength(2);
  });

  it('pulsanti, puntini e frecce cambiano slide; dopo l’ultima torna la prima', async () => {
    const { elemento, attiva, premi, clic } = await crea(['A', 'B', 'C']);

    await clic('.comandi > button', 1);
    expect(attiva()).toBe('B');
    await premi('ArrowRight');
    expect(attiva()).toBe('C');
    await premi('ArrowRight');
    expect(attiva()).toBe('A');
    await clic('.comandi > button');
    expect(attiva()).toBe('C');
    await clic('.puntino', 1);
    expect(attiva()).toBe('B');
    expect(elemento.querySelector('.puntino[aria-current="true"]')).toBe(
      elemento.querySelectorAll('.puntino')[1],
    );
  });

  it('il dito verso sinistra porta avanti, un tocco breve non sposta', async () => {
    const { attiva, trascina } = await crea(['A', 'B', 'C']);

    await trascina(200, 190);
    expect(attiva()).toBe('A');
    await trascina(200, 100);
    expect(attiva()).toBe('B');
    await trascina(100, 200);
    expect(attiva()).toBe('A');
  });

  it('una slide sola resta ferma, senza comandi', async () => {
    const { elemento, attiva, premi } = await crea(['A']);

    await premi('ArrowRight');

    expect(attiva()).toBe('A');
    expect(elemento.querySelector('.palco')?.classList).toContain('singola');
    expect(elemento.querySelector('.palco')?.getAttribute('tabindex')).toBeNull();
    expect(elemento.querySelector('.comandi')).toBeNull();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { GalleriaComponent } from './galleria-component';

describe('GalleriaComponent', () => {
  const foto = (id: number) =>
    ({ id, percorso: `media/${id}.webp`, testo_alternativo: `Foto ${id}` }) as MediaInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  let fixture: ComponentFixture<GalleriaComponent>;

  async function crea(media: MediaInterface[]) {
    fixture = TestBed.createComponent(GalleriaComponent);
    fixture.componentRef.setInput('media', media);
    fixture.componentRef.setInput('etichetta', 'Foto della camera');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra le foto in una regione con nome, solo la prima senza caricamento pigro', async () => {
    const elemento = await crea([foto(1), foto(2)]);

    const immagini = elemento.querySelectorAll('img');
    expect(elemento.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe(
      'Foto della camera',
    );
    expect(immagini).toHaveLength(2);
    expect(immagini[0].getAttribute('loading')).toBeNull();
    expect(immagini[1].getAttribute('loading')).toBe('lazy');
  });

  /** jsdom non impagina: misure e scorrimento sono finti, come uno schermo da 3 foto larghe 100px. */
  async function impagina(elemento: HTMLElement, scrollLeft = 0) {
    const striscia = elemento.querySelector<HTMLElement>('.striscia')!;
    const foto = [...striscia.querySelectorAll('img')];
    const misure = { clientWidth: 300, scrollWidth: foto.length * 100, scrollLeft };
    for (const [nome, valore] of Object.entries(misure)) {
      Object.defineProperty(striscia, nome, { value: valore, configurable: true });
    }
    foto.forEach((img, indice) => {
      Object.defineProperty(img, 'offsetWidth', { value: 100 });
      Object.defineProperty(img, 'offsetLeft', { value: indice * 100 });
    });
    striscia.scrollTo = vi.fn();
    striscia.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    return striscia;
  }

  it('un puntino per schermata, segnato quello in vista', async () => {
    const elemento = await crea([1, 2, 3, 4, 5, 6, 7].map(foto));
    await impagina(elemento, 300);

    const puntini = elemento.querySelectorAll('.puntino');
    expect(puntini).toHaveLength(3);
    expect(puntini[1].getAttribute('aria-current')).toBe('true');
  });

  it('le frecce dopo l’ultima schermata ricominciano dalla prima, e viceversa', async () => {
    const elemento = await crea([1, 2, 3, 4, 5, 6, 7].map(foto));
    const striscia = await impagina(elemento, 400);
    const pulsanti = elemento.querySelectorAll<HTMLButtonElement>('.comandi > button');

    pulsanti[1].click();
    expect(striscia.scrollTo).toHaveBeenLastCalledWith({ left: 0 });

    await impagina(elemento, 0);
    pulsanti[0].click();
    expect(striscia.scrollTo).toHaveBeenLastCalledWith({ left: 600 });
    elemento.querySelectorAll<HTMLButtonElement>('.puntino')[1].click();
    expect(striscia.scrollTo).toHaveBeenLastCalledWith({ left: 300 });
  });

  it('se le foto stanno tutte in una schermata non mostra i comandi', async () => {
    const elemento = await crea([1, 2, 3].map(foto));
    await impagina(elemento);

    expect(elemento.querySelector('button')).toBeNull();
  });

  it('con una sola foto non mostra i pulsanti', async () => {
    const elemento = await crea([foto(1)]);

    expect(elemento.querySelector('button')).toBeNull();
  });
});

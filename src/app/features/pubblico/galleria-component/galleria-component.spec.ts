import { TestBed } from '@angular/core/testing';
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

  async function crea(media: MediaInterface[]) {
    const fixture = TestBed.createComponent(GalleriaComponent);
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

  it('i pulsanti scorrono di una schermata', async () => {
    const elemento = await crea([foto(1), foto(2)]);
    const striscia = elemento.querySelector<HTMLElement>('.striscia')!;
    // jsdom non impagina: larghezza e scorrimento sono finti.
    Object.defineProperty(striscia, 'clientWidth', { value: 300 });
    striscia.scrollBy = vi.fn();

    const [indietro, avanti] = elemento.querySelectorAll('button');
    avanti.click();
    indietro.click();

    expect(striscia.scrollBy).toHaveBeenNthCalledWith(1, { left: 300 });
    expect(striscia.scrollBy).toHaveBeenNthCalledWith(2, { left: -300 });
  });

  it('con una sola foto non mostra i pulsanti', async () => {
    const elemento = await crea([foto(1)]);

    expect(elemento.querySelector('button')).toBeNull();
  });
});

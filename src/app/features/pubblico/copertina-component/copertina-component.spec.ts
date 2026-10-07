import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { CopertinaComponent } from './copertina-component';

describe('CopertinaComponent', () => {
  const foto = { percorso: 'media/mare.webp' } as MediaInterface;

  beforeEach(() => TestBed.configureTestingModule({ imports: [traduzioniTest()] }));

  async function crea(valori: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CopertinaComponent);
    fixture.componentRef.setInput('titolo', 'Le camere');
    Object.entries(valori).forEach(([nome, valore]) => fixture.componentRef.setInput(nome, valore));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('con la foto riempie lo schermo e invita a scorrere', async () => {
    const elemento = await crea({ foto, testo: 'Vista mare', occhiello: 'Dormire' });

    expect(elemento.classList).toContain('copertina-schermo');
    expect(elemento.querySelector('.sfondo')?.getAttribute('src')).toContain('media/mare.webp');
    expect(elemento.querySelector('.occhiello')?.textContent).toBe('Dormire');
    expect(elemento.querySelector('h1')?.textContent).toBe('Le camere');
    expect(elemento.querySelector('.introduzione')?.textContent).toBe('Vista mare');
    expect(elemento.querySelector('app-scorri')).not.toBeNull();
  });

  it('senza foto né testo resta il solo titolo', async () => {
    const elemento = await crea({ testo: null });

    expect(elemento.classList).not.toContain('copertina-schermo');
    expect(elemento.querySelector('.introduzione, .occhiello, app-scorri')).toBeNull();
  });

  it("non invita a scorrere se sotto non c'è niente", async () => {
    const elemento = await crea({ foto, scorri: false });

    expect(elemento.querySelector('app-scorri')).toBeNull();
  });
});

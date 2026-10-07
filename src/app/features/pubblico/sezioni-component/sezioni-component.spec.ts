import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { MediaInterface } from '../../../shared/models/media/media-model';
import { SezioneInterface } from '../../../shared/models/sezione/sezione-model';
import { SezioniComponent } from './sezioni-component';

describe('SezioniComponent', () => {
  const sezione = (id: number, media: Partial<MediaInterface>[] = []) =>
    ({ id, titolo: `Sezione ${id}`, testo: 'Testo', media }) as SezioneInterface;

  async function crea(sezioni: SezioneInterface[]) {
    const fixture = TestBed.createComponent(SezioniComponent);
    fixture.componentRef.setInput('sezioni', sezioni);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('una sezione per blocco, con la prima immagine se c’è', async () => {
    const elemento = await crea([
      sezione(1, [{ percorso: 'media/giardino.webp', testo_alternativo: 'Il giardino' }]),
      sezione(2),
    ]);

    const blocchi = elemento.querySelectorAll('.blocco');
    expect(blocchi).toHaveLength(2);
    expect(blocchi[0].querySelector('img')?.getAttribute('alt')).toBe('Il giardino');
    expect(blocchi[1].querySelector('img')).toBeNull();
    expect(blocchi[1].querySelector('h2')?.textContent).toBe('Sezione 2');
  });
});

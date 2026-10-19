import { describe, expect, it } from 'vitest';

import { ENTITA_MEDIA } from '../../../core/services/camere/camere-costanti';
import { MediaInterface } from './media-model';

describe('MediaInterface', () => {
  it("accetta un'immagine di una tipologia di camera", () => {
    const media: MediaInterface = {
      id: 4,
      entita: 'tipologia_camera',
      entita_id: 2,
      percorso: 'media/tipologie/doppia-1.webp',
      tipo_mime: 'image/webp',
      dimensione: 182_000,
      larghezza: 1600,
      altezza: 1067,
      testo_alternativo: 'Camera doppia con vista mare',
      ordine: 0,
      creato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(ENTITA_MEDIA).toContain(media.entita);
  });
});

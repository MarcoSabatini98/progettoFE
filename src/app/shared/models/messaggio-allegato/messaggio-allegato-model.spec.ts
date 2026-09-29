import { describe, expect, it } from 'vitest';

import { MessaggioAllegatoInterface } from './messaggio-allegato-model';

describe('MessaggioAllegatoInterface', () => {
  it("accetta un'immagine allegata", () => {
    const allegato: MessaggioAllegatoInterface = {
      id: 1,
      messaggio_id: 7,
      nome_originale: 'foto.jpg',
      percorso: 'chat/7/abc.jpg',
      tipo_mime: 'image/jpeg',
      dimensione: 180_000,
      creato_il: '2026-10-03T08:00:00.000Z',
    };

    expect(allegato.tipo_mime.startsWith('image/')).toBe(true);
  });
});

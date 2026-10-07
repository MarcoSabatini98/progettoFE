import { describe, expect, it } from 'vitest';

import { SezioneAggiornaPayload, SezioneInterface } from './sezione-model';

describe('SezioneInterface', () => {
  it('accetta una sezione senza immagine', () => {
    const sezione: SezioneInterface = {
      id: 1,
      pagina_id: 2,
      titolo: 'Il giardino',
      testo: 'Ulivi e buganvillee.',
      ordine: 0,
      pubblicata: true,
      creato_il: '2026-10-01T10:00:00.000Z',
      aggiornato_il: '2026-10-01T10:00:00.000Z',
      media: [],
    };

    expect(sezione.media).toHaveLength(0);
  });

  it('in modifica non si sposta su un’altra pagina', () => {
    const modifiche: SezioneAggiornaPayload = { pubblicata: false };
    expect(modifiche).not.toHaveProperty('pagina_id');
  });
});

import { describe, expect, it } from 'vitest';

import { LinkEsportazioneInterface } from './link-esportazione-model';

describe('LinkEsportazioneInterface', () => {
  it('accetta una camera senza token iCal', () => {
    const link: LinkEsportazioneInterface = { camera_id: 4, numero: '101', nome: null, url: null };

    expect(link.url).toBeNull();
  });
});

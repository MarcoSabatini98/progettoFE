import { describe, expect, it } from 'vitest';

import { AnteprimaCancellazioneInterface } from './anteprima-cancellazione-model';

describe('AnteprimaCancellazioneInterface', () => {
  it('accetta una cancellazione ancora gratuita', () => {
    const anteprima: AnteprimaCancellazioneInterface = {
      penale: 0,
      gratuita_fino_al: '2026-09-29T15:00:00.000Z',
      incassato: 60,
    };

    expect(anteprima.incassato - anteprima.penale).toBe(60);
  });
});

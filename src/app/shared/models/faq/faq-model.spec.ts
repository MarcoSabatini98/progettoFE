import { describe, expect, it } from 'vitest';

import { FaqInterface } from './faq-model';

describe('FaqInterface', () => {
  it('accetta una FAQ pubblicata', () => {
    const faq: FaqInterface = {
      id: 1,
      domanda: 'A che ora è il check-in?',
      risposta: 'Dalle 14 alle 20.',
      categoria: 'soggiorno',
      ordine: 1,
      pubblicata: true,
      creato_da: null,
      aggiornato_da: null,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
    };

    expect(faq.pubblicata).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { LINGUE } from '../../../core/services/lingua/lingua-costanti';
import { Lingua } from './lingua-model';

describe('Lingua', () => {
  it('accetta un codice lingua del sito', () => {
    // Il tipo deriva da LINGUE: ogni valore ammesso è anche nell'elenco del selettore.
    const lingua: Lingua = 'en';
    expect(LINGUE).toContain(lingua);
  });
});

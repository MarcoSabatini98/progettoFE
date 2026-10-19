import { describe, expect, it } from 'vitest';

import { PREFERENZE_TEMA } from '../../../core/services/tema/tema-costanti';
import { PreferenzaTema } from './tema-model';

describe('PreferenzaTema', () => {
  it('accetta una preferenza di tema valida', () => {
    // Il tipo deriva da PREFERENZE_TEMA: ogni valore ammesso è anche tra le scelte.
    const preferenza: PreferenzaTema = 'scuro';
    expect(PREFERENZE_TEMA).toContain(preferenza);
  });
});

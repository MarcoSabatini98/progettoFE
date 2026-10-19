import { describe, expect, it } from 'vitest';

import { CondizioniSoggiornoInterface } from './condizioni-soggiorno-model';

describe('CondizioniSoggiornoInterface', () => {
  it('accetta un soggiorno senza piani né tassa in vigore', () => {
    const condizioni: CondizioniSoggiornoInterface = { piani: [], tassa: null };

    expect(condizioni.piani).toHaveLength(0);
    expect(condizioni.tassa).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { StatoAssistenzaInterface } from './stato-assistenza-model';

describe('StatoAssistenzaInterface', () => {
  it('accetta lo staff non disponibile', () => {
    const stato: StatoAssistenzaInterface = { disponibile: false };

    expect(stato.disponibile).toBe(false);
  });
});

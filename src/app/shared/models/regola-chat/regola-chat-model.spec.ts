import { describe, expect, it } from 'vitest';

import { RegolaChatInterface } from './regola-chat-model';

describe('RegolaChatInterface', () => {
  it('accetta una coppia di ruoli', () => {
    const regola: RegolaChatInterface = { ruolo_a: 'housekeeper', ruolo_b: 'receptionist' };
    expect(regola.ruolo_a).toBe('housekeeper');
  });
});

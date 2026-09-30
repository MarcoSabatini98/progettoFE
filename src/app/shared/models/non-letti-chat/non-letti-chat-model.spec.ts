import { describe, expect, it } from 'vitest';

import { NonLettiChatInterface } from './non-letti-chat-model';

describe('NonLettiChatInterface', () => {
  it('accetta i contatori di un cliente', () => {
    const nonLetti: NonLettiChatInterface = { staff: 0, assistenza: 2, libere: 0 };

    expect(nonLetti.assistenza).toBe(2);
  });
});

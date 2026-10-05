import { describe, expect, it } from 'vitest';

import { conSpunta } from './con-spunta';

describe('conSpunta', () => {
  it("aggiunge o toglie senza toccare l'originale", () => {
    const insieme = new Set(['a']);

    expect([...conSpunta(insieme, 'b', true)]).toEqual(['a', 'b']);
    expect([...conSpunta(insieme, 'a', false)]).toEqual([]);
    expect([...insieme]).toEqual(['a']);
  });
});

import { describe, expect, it } from 'vitest';

import { InizialiPipe } from './iniziali-pipe';

describe('InizialiPipe', () => {
  const pipe = new InizialiPipe();

  it('prende le iniziali delle prime due parole', () => {
    expect(pipe.transform('anna  rossi bianchi')).toBe('AR');
  });

  it('con una parola sola restituisce una lettera', () => {
    expect(pipe.transform('Lavanda')).toBe('L');
  });

  it('con testo vuoto o assente restituisce stringa vuota', () => {
    expect(pipe.transform('  ')).toBe('');
    expect(pipe.transform(null)).toBe('');
  });
});

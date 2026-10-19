import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { LinguaService } from '../../core/services/lingua/lingua-service';
import { VotoPipe } from './voto-pipe';

describe('VotoPipe', () => {
  const lingua = signal('it');
  let pipe: VotoPipe;

  beforeEach(() => {
    lingua.set('it');
    TestBed.configureTestingModule({
      providers: [VotoPipe, { provide: LinguaService, useValue: { attiva: lingua } }],
    });
    pipe = TestBed.inject(VotoPipe);
  });

  it('arrotonda a un decimale nella lingua del sito', () => {
    expect(pipe.transform('4.56')).toBe('4,6');
    expect(pipe.transform(5)).toBe('5');

    lingua.set('en');
    expect(pipe.transform(4.5)).toBe('4.5');
  });

  it('senza voto restituisce stringa vuota', () => {
    expect(pipe.transform(null)).toBe('');
  });
});

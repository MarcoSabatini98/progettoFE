import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { LinguaService } from '../../core/services/lingua/lingua-service';
import { PaesePipe } from './paese-pipe';

describe('PaesePipe', () => {
  const lingua = signal('it');
  let pipe: PaesePipe;

  beforeEach(() => {
    lingua.set('it');
    TestBed.configureTestingModule({
      providers: [PaesePipe, { provide: LinguaService, useValue: { attiva: lingua } }],
    });
    pipe = TestBed.inject(PaesePipe);
  });

  it('traduce il codice nella lingua del sito', () => {
    expect(pipe.transform('DE')).toBe('Germania');

    lingua.set('en');
    expect(pipe.transform('de')).toBe('Germany');
  });

  it('senza codice restituisce stringa vuota', () => {
    expect(pipe.transform(null)).toBe('');
  });
});

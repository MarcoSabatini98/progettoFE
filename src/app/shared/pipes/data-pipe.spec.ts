import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { LinguaService } from '../../core/services/lingua/lingua-service';
import { DataPipe } from './data-pipe';

describe('DataPipe', () => {
  const lingua = signal('it');
  let pipe: DataPipe;

  beforeEach(() => {
    lingua.set('it');
    TestBed.configureTestingModule({
      providers: [DataPipe, { provide: LinguaService, useValue: { attiva: lingua } }],
    });
    pipe = TestBed.inject(DataPipe);
  });

  it('scrive una data di calendario senza slittare di giorno', () => {
    expect(pipe.transform('2026-10-01')).toBe('1 ottobre 2026');
  });

  it('nel formato mese mostra solo mese e anno', () => {
    expect(pipe.transform('2026-10-01', 'mese')).toBe('ottobre 2026');
  });

  it('nel formato ora mostra giorno e orario di un istante', () => {
    expect(pipe.transform('2026-10-01T15:30:00', 'ora')).toBe('1 ottobre alle ore 15:30');
  });

  it('nel formato settimana mostra giorno della settimana e numero', () => {
    expect(pipe.transform('2026-10-03', 'settimana')).toBe('sab 3');
  });

  it('segue la lingua del sito', () => {
    lingua.set('en');

    expect(pipe.transform('2026-10-01')).toBe('October 1, 2026');
  });

  it('senza data restituisce stringa vuota', () => {
    expect(pipe.transform(null)).toBe('');
  });
});

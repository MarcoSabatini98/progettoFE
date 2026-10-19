import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { PrezzoPipe } from './prezzo-pipe';

describe('PrezzoPipe', () => {
  const lingua = signal('it');
  const valuta = signal('');
  let pipe: PrezzoPipe;

  beforeEach(() => {
    lingua.set('it');
    valuta.set('');
    TestBed.configureTestingModule({
      providers: [
        PrezzoPipe,
        { provide: LinguaService, useValue: { attiva: lingua } },
        { provide: ImpostazioniService, useValue: { testo: () => valuta() } },
      ],
    });
    pipe = TestBed.inject(PrezzoPipe);
  });

  it('scrive euro all’italiana se la valuta non è impostata', () => {
    // In italiano le migliaia si separano solo da 10.000 in su (regola CLDR).
    expect(pipe.transform(12000)).toMatch(/^12\.000,00\s€$/);
  });

  it('accetta i decimali arrivati come testo', () => {
    expect(pipe.transform('90.50')).toMatch(/^90,50\s€$/);
  });

  it('segue lingua e valuta della struttura', () => {
    lingua.set('en');
    valuta.set('USD');

    expect(pipe.transform(1200)).toBe('$1,200.00');
  });

  it('senza importo restituisce stringa vuota', () => {
    expect(pipe.transform(null)).toBe('');
  });
});

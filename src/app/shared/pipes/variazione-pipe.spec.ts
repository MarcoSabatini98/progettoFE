import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { VariazionePipe } from './variazione-pipe';

describe('VariazionePipe', () => {
  let pipe: VariazionePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VariazionePipe,
        { provide: LinguaService, useValue: { attiva: signal('it') } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
    pipe = TestBed.inject(VariazionePipe);
  });

  it('le percentuali col segno di percento, anche negative', () => {
    expect(pipe.transform('10.00', 'percentuale')).toMatch(/^10\s?%$/);
    expect(pipe.transform(-12.5, 'percentuale')).toMatch(/^-12,5\s?%$/);
  });

  it('gli importi nella valuta della struttura', () => {
    expect(pipe.transform('15.00', 'importo')).toMatch(/^15,00\s€$/);
    expect(pipe.transform(80, 'prezzo_fisso')).toMatch(/^80,00\s€$/);
  });
});

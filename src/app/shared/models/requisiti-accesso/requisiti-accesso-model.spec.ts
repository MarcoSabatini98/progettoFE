import { describe, expect, it } from 'vitest';

import { RequisitiAccessoInterface } from './requisiti-accesso-model';

describe('RequisitiAccessoInterface', () => {
  it('accetta ruoli e permessi insieme', () => {
    const requisiti: RequisitiAccessoInterface = {
      ruoli: ['admin', 'receptionist'],
      permessi: ['prenotazioni.leggi'],
    };

    expect(requisiti.ruoli).toContain('receptionist');
  });

  it('senza requisiti è un oggetto vuoto', () => {
    const requisiti: RequisitiAccessoInterface = {};

    expect(Object.keys(requisiti)).toHaveLength(0);
  });
});

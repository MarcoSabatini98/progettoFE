import { describe, expect, it } from 'vitest';

import { ChecklistModelloInterface } from './checklist-modello-model';

describe('ChecklistModelloInterface', () => {
  it('accetta una voce valida per ogni tipo di pulizia', () => {
    const voce: ChecklistModelloInterface = {
      id: 1,
      voce: 'Cambio asciugamani',
      tipo_pulizia: null,
      ordine: 1,
      attiva: true,
    };

    expect(voce.tipo_pulizia).toBeNull();
  });
});

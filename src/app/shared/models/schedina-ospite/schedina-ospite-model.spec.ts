import { describe, expect, it } from 'vitest';

import { SchedinaOspiteInterface } from './schedina-ospite-model';

describe('SchedinaOspiteInterface', () => {
  it('accetta un ospite con dati mancanti e senza schedina', () => {
    const scheda: SchedinaOspiteInterface = {
      ospite_id: 5,
      nome: 'Anna',
      cognome: 'Rossi',
      tipo_alloggiato: 'ospite_singolo',
      campi_mancanti: ['luogo_nascita'],
      schedina: null,
      ultimo_invio: null,
    };

    expect(scheda.schedina).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { PermessoInterface } from './permesso-model';

describe('PermessoInterface', () => {
  it('accetta un permesso con codice tra quelli del backend', () => {
    const permesso: PermessoInterface = {
      codice: 'prenotazioni.gestisci',
      modulo: 'prenotazioni',
      descrizione: 'Crea e modifica le prenotazioni',
    };

    expect(Object.values(PERMESSI)).toContain(permesso.codice);
  });
});

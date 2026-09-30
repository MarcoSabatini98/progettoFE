import { describe, expect, it } from 'vitest';

import { ICONE_AVVISO } from '../../../core/services/avvisi/avvisi-costanti';
import { AvvisoInterface } from './avviso-model';

describe('AvvisoInterface', () => {
  it('ogni tipo di avviso ha la sua icona', () => {
    const avviso: AvvisoInterface = { id: 1, testo: 'Password aggiornata', tipo: 'successo' };

    expect(ICONE_AVVISO[avviso.tipo]).toBe('check_circle');
  });
});

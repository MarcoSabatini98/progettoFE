import { describe, expect, it } from 'vitest';

import { AttivitaPuliziaInterface } from '../attivita-pulizia/attivita-pulizia-model';
import { ColonnaPulizieInterface, SpostamentoPuliziaInterface } from './colonna-pulizie-model';

describe('ColonnaPulizieInterface', () => {
  it('raccoglie le attività di uno stato o di un addetto', () => {
    const attivita = { id: 9 } as AttivitaPuliziaInterface;
    const colonna: ColonnaPulizieInterface = {
      chiave: '4',
      titolo: 'gestionale.pulizie.addetto',
      parametri: { nome: 'Anna', cognome: 'Bianchi' },
      attivita: [attivita],
    };
    const spostamento: SpostamentoPuliziaInterface = { attivita, verso: 'libere' };

    expect(colonna.attivita).toContain(spostamento.attivita);
  });
});

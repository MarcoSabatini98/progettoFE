import { describe, expect, it } from 'vitest';

import { creaFormDati } from './form-dati';

describe('creaFormDati', () => {
  it('ripete il campo per ogni file', () => {
    const form = creaFormDati({ allegati: [new File(['a'], 'a.jpg'), new File(['b'], 'b.jpg')] });
    expect(form.getAll('allegati')).toHaveLength(2);
  });

  it('converte i numeri in testo e tiene il testo vuoto', () => {
    const form = creaFormDati({ risposta_a_id: 7, testo: '' });
    expect(form.get('risposta_a_id')).toBe('7');
    expect(form.get('testo')).toBe('');
  });

  it('salta i valori assenti', () => {
    const form = creaFormDati({ testo: undefined, risposta_a_id: null });
    expect([...form.keys()]).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';

import { creaParametri } from './parametri-http';

describe('creaParametri', () => {
  it('converte numeri e booleani in testo', () => {
    const parametri = creaParametri({ pagina: 2, attivo: false });
    expect(parametri.get('pagina')).toBe('2');
    expect(parametri.get('attivo')).toBe('false');
  });

  it('unisce le liste con la virgola', () => {
    expect(creaParametri({ stato: ['confermata', 'in_soggiorno'] }).get('stato')).toBe(
      'confermata,in_soggiorno',
    );
  });

  it('salta valori assenti, vuoti e liste vuote', () => {
    const parametri = creaParametri({ cerca: '', camera_id: undefined, dal: null, stato: [] });
    expect(parametri.keys()).toEqual([]);
  });

  it('senza filtri restituisce parametri vuoti', () => {
    expect(creaParametri().keys()).toEqual([]);
  });
});

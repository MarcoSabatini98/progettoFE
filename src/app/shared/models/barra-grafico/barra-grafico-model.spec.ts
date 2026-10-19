import { describe, expect, it } from 'vitest';

import { BarraGraficoInterface, FormatoGrafico } from './barra-grafico-model';

describe('BarraGraficoInterface', () => {
  it('ha etichetta corta, dettaglio esteso e valore', () => {
    const barra: BarraGraficoInterface = {
      etichetta: '4',
      dettaglio: 'domenica 4 ottobre',
      valore: 75,
    };
    const formato: FormatoGrafico = 'percentuale';

    expect(barra.dettaglio).toContain(barra.etichetta);
    expect(formato).toBe('percentuale');
  });
});

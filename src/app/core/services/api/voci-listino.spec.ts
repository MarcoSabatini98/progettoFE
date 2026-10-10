import { describe, expect, it } from 'vitest';

import { archiviata, contiene } from './voci-listino';

describe('voci-listino', () => {
  const oggi = '2026-10-11';

  it('archiviata: disattivata o finita prima di oggi', () => {
    expect(archiviata({ attivo: false }, oggi)).toBe(true);
    expect(archiviata({ attivo: true, valido_al: '2026-10-10' }, oggi)).toBe(true);
    expect(archiviata({ data_fine: '2025-08-31' }, oggi)).toBe(true);
  });

  it('non archiviata: attiva, senza scadenza o valida fino a oggi', () => {
    expect(archiviata({ attivo: true, valido_al: null }, oggi)).toBe(false);
    expect(archiviata({ data_fine: oggi }, oggi)).toBe(false);
    expect(archiviata({ nome: 'Wi-Fi' }, oggi)).toBe(false);
  });

  it('contiene: confronta i campi di testo senza maiuscole né accenti', () => {
    const voce = { id: 1, nome: 'Città d’arte', codice: 'ESTATE10', valore: 10 };

    expect(contiene(voce, ' citta ')).toBe(true);
    expect(contiene(voce, 'estate')).toBe(true);
    expect(contiene(voce, '10')).toBe(true);
    expect(contiene(voce, 'mare')).toBe(false);
    expect(contiene({ valore: 10 }, '1')).toBe(false);
    expect(contiene({ valore: 10 }, ' ')).toBe(true);
  });
});

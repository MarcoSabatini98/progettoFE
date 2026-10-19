import { describe, expect, it } from 'vitest';

import { PacchettoInterface } from './pacchetto-model';

describe('PacchettoInterface', () => {
  it('accetta un pacchetto con servizi e quantità', () => {
    const pacchetto: PacchettoInterface = {
      id: 1,
      nome: 'Weekend romantico',
      slug: 'weekend-romantico',
      descrizione: null,
      prezzo: 290,
      tipologia_id: null,
      notti_min: 2,
      valido_dal: null,
      valido_al: null,
      attivo: true,
      ordine: 1,
      creato_il: '2026-09-01T10:00:00.000Z',
      aggiornato_il: '2026-09-01T10:00:00.000Z',
      servizi: [
        {
          id: 5,
          nome: 'Cena',
          descrizione: null,
          icona: null,
          tipo: 'extra',
          prezzo: 40,
          calcolo_prezzo: 'a_persona',
          aliquota_iva: 10,
          ordine: 1,
          attivo: true,
          creato_il: '2026-09-01T10:00:00.000Z',
          aggiornato_il: '2026-09-01T10:00:00.000Z',
          eliminato_il: null,
          PacchettoServizio: { quantita: 1 },
        },
      ],
    };

    expect(pacchetto.servizi?.[0].PacchettoServizio.quantita).toBe(1);
  });
});

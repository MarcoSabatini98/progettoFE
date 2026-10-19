import { describe, expect, it } from 'vitest';

import { GruppoMenuInterface } from './voce-menu-model';

describe('GruppoMenuInterface', () => {
  it('accetta voci con e senza requisiti', () => {
    const gruppo: GruppoMenuInterface = {
      etichetta: 'menu.gruppi.oggi',
      voci: [
        { etichetta: 'menu.voci.chat', percorso: '/staff/chat', icona: 'chat' },
        {
          etichetta: 'menu.voci.pulizie',
          percorso: '/staff/pulizie',
          icona: 'cleaning_services',
          permessi: ['pulizie.leggi'],
        },
      ],
    };

    expect(gruppo.voci.filter((voce) => voce.permessi)).toHaveLength(1);
  });
});

import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { apriSezione } from '../listino-component/sezione-listino-test';
import { PromozioniComponent } from './promozioni-component';

describe('PromozioniComponent', () => {
  const promozione = {
    id: 3,
    nome: 'Prenota prima',
    tipologia_id: null,
    soggiorno_dal: '2026-07-01',
    soggiorno_al: '2026-08-31',
    tipo_sconto: 'percentuale',
    valore: '15.00',
    attiva: true,
  };

  async function apri() {
    const tariffe = {
      elencaPromozioni: vi.fn(() => of([promozione])),
      creaPromozione: vi.fn(() => of(promozione)),
      aggiornaPromozione: vi.fn(() => of(promozione)),
      eliminaPromozione: vi.fn(() => of(null)),
    };
    const sezione = await apriSezione(PromozioniComponent, tariffe, {
      tipologie: [{ id: 1, nome: 'Doppia' }],
    });
    return { ...sezione, tariffe };
  }

  it('una promozione nuova può valere per una sola tipologia', async () => {
    const { fixture, tariffe, campo, scrivi, invia } = await apri();
    await scrivi('nome', 'Doppia in offerta');
    await scrivi('soggiorno_dal', '2026-10-01');
    await scrivi('soggiorno_al', '2026-10-31');
    await scrivi('valore', '10');
    const tipologia = campo('tipologia_id') as unknown as HTMLSelectElement;
    tipologia.selectedIndex = 1;
    tipologia.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    await invia();

    expect(tariffe.creaPromozione).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Doppia in offerta',
        tipologia_id: 1,
        valore: 10,
        prenotabile_dal: null,
        ospiti_min: null,
      }),
    );
  });

  it('senza valore non salva', async () => {
    const { tariffe, scrivi, invia } = await apri();
    await scrivi('nome', 'Vuota');

    await invia();

    expect(tariffe.creaPromozione).not.toHaveBeenCalled();
  });
});

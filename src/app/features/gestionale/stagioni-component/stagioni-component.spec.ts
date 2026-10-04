import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { apriSezione } from '../listino-component/sezione-listino-test';
import { StagioniComponent } from './stagioni-component';

describe('StagioniComponent', () => {
  const stagione = {
    id: 6,
    nome: 'Weekend estivi',
    tipologia_id: 1,
    tipologia: { id: 1, nome: 'Doppia' },
    data_inizio: '2026-06-01',
    data_fine: '2026-09-15',
    tipo_variazione: 'percentuale',
    valore: '20.00',
    giorni_settimana: 48,
    soggiorno_minimo: 2,
    priorita: 1,
    attivo: true,
  };

  async function apri() {
    const tariffe = {
      elencaPeriodi: vi.fn(() => of([stagione])),
      creaPeriodo: vi.fn(() => of(stagione)),
      aggiornaPeriodo: vi.fn(() => of(stagione)),
      eliminaPeriodo: vi.fn(() => of(null)),
    };
    const sezione = await apriSezione(StagioniComponent, tariffe, {
      tipologie: [{ id: 1, nome: 'Doppia' }],
    });
    const giorni = () =>
      Array.from(sezione.elemento.querySelectorAll<HTMLInputElement>('.giorni input'));
    return { ...sezione, tariffe, giorni };
  }

  it('la stagione scelta spunta i suoi giorni', async () => {
    const { scegli, giorni } = await apri();

    await scegli();

    expect(giorni().map((giorno) => giorno.checked)).toEqual([
      false,
      false,
      false,
      false,
      true,
      true,
      false,
    ]);
  });

  it('togliere un giorno spegne il suo bit e lo salva', async () => {
    const { fixture, tariffe, scegli, giorni, invia } = await apri();
    await scegli();

    giorni()[4].click();
    await fixture.whenStable();
    await invia();

    expect(tariffe.aggiornaPeriodo).toHaveBeenCalledWith(6, { giorni_settimana: 32 });
  });

  it('senza giorni avvisa e non salva', async () => {
    const { fixture, elemento, tariffe, giorni, scrivi, invia } = await apri();
    await scrivi('nome', 'Ponte');
    await scrivi('data_inizio', '2026-11-01');
    await scrivi('data_fine', '2026-11-03');

    for (const giorno of giorni()) giorno.click();
    await fixture.whenStable();
    await invia();

    expect(elemento.textContent).toContain('gestionale.tariffe.stagioni.nessunGiorno');
    expect(tariffe.creaPeriodo).not.toHaveBeenCalled();
  });
});

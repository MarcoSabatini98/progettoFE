import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { apriSezione } from '../listino-component/sezione-listino-test';
import { EventiComponent } from './eventi-component';

describe('EventiComponent', () => {
  const evento = {
    id: 3,
    titolo: 'Fiera del vino',
    tipo: 'fiera',
    data_inizio: '2027-05-10',
    data_fine: '2027-05-12',
    impatto: 8,
    note: null,
  };
  const contenuti = {
    elencaEventi: vi.fn(),
    creaEvento: vi.fn(),
    aggiornaEvento: vi.fn(),
    eliminaEvento: vi.fn(),
  };

  beforeEach(() => {
    Object.values(contenuti).forEach((spia) => spia.mockReset());
    contenuti.elencaEventi.mockReturnValue(of([evento]));
    contenuti.creaEvento.mockReturnValue(of(evento));
  });

  const apri = () =>
    apriSezione(EventiComponent, {}, {}, [
      { provide: ContenutiService, useValue: contenuti },
      { provide: AvvisiService, useValue: { mostra: vi.fn() } },
    ]);

  it('elenca gli eventi col loro peso', async () => {
    const { elemento } = await apri();

    expect(elemento.querySelector('.voce')?.textContent).toContain('Fiera del vino');
    expect(elemento.querySelector('.voce')?.textContent).toContain(
      'gestionale.contenuti.eventi.tipi.fiera',
    );
  });

  it('nuovo evento: titolo, tipo, date, impatto', async () => {
    const { scrivi, invia } = await apri();
    await scrivi('titolo', 'Sagra');
    await scrivi('tipo', 'festivita', 'change');
    await scrivi('data_inizio', '2027-08-14');
    await scrivi('data_fine', '2027-08-16');
    await scrivi('impatto', '6');

    await invia();

    expect(contenuti.creaEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        titolo: 'Sagra',
        tipo: 'festivita',
        data_inizio: '2027-08-14',
        data_fine: '2027-08-16',
        impatto: 6,
      }),
    );
  });

  it('senza titolo non crea', async () => {
    const { scrivi, invia } = await apri();
    await scrivi('data_inizio', '2027-08-14');
    await scrivi('data_fine', '2027-08-16');

    await invia();

    expect(contenuti.creaEvento).not.toHaveBeenCalled();
  });
});

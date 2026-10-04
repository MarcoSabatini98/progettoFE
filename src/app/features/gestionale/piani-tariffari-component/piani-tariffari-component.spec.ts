import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { apriSezione } from '../listino-component/sezione-listino-test';
import { PianiTariffariComponent } from './piani-tariffari-component';

describe('PianiTariffariComponent', () => {
  const piano = {
    id: 2,
    nome: 'Non rimborsabile',
    descrizione: null,
    tipo_variazione: 'percentuale',
    valore_variazione: '-10.00',
    rimborsabile: false,
    ore_cancellazione_gratuita: 0,
    penale_percentuale: '100.00',
    acconto_percentuale: '100.00',
    predefinito: false,
    attivo: true,
    ordine: 1,
  };

  async function apri() {
    const tariffe = {
      elencaPiani: vi.fn(() => of([piano])),
      creaPiano: vi.fn(() => of(piano)),
      aggiornaPiano: vi.fn(() => of(piano)),
      eliminaPiano: vi.fn(() => of(null)),
    };
    return { ...(await apriSezione(PianiTariffariComponent, tariffe)), tariffe };
  }

  it('elenca i piani con variazione e rimborso', async () => {
    const { elemento } = await apri();

    expect(elemento.querySelector('.voce')?.textContent).toContain('Non rimborsabile');
    expect(elemento.textContent).toContain('gestionale.tariffe.nonRimborsabile');
  });

  it('un piano nuovo parte dalle regole più comuni', async () => {
    const { tariffe, scrivi, invia } = await apri();

    await scrivi('nome', 'Flessibile');
    await invia();

    expect(tariffe.creaPiano).toHaveBeenCalledWith({
      nome: 'Flessibile',
      descrizione: null,
      tipo_variazione: 'percentuale',
      valore_variazione: 0,
      rimborsabile: true,
      ore_cancellazione_gratuita: 48,
      penale_percentuale: 0,
      acconto_percentuale: 30,
      predefinito: false,
      attivo: true,
      ordine: 0,
    });
  });

  it('il piano scelto compila il modulo e salva solo i cambi', async () => {
    const { tariffe, campo, scegli, scrivi, invia } = await apri();

    await scegli();
    expect(campo('valore_variazione').value).toBe('-10');
    await scrivi('valore_variazione', '-15');
    await invia();

    expect(tariffe.aggiornaPiano).toHaveBeenCalledWith(2, { valore_variazione: -15 });
  });
});

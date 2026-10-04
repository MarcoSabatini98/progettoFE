import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { apriSezione } from '../listino-component/sezione-listino-test';
import { TasseSoggiornoComponent } from './tasse-soggiorno-component';

describe('TasseSoggiornoComponent', () => {
  const tassa = {
    id: 1,
    nome: 'Tassa 2026',
    valida_dal: '2026-01-01',
    valida_al: '2026-12-31',
    importo_notte: '2.50',
    notti_max: 7,
    eta_esenzione: 14,
    attiva: true,
  };

  async function apri() {
    const tariffe = {
      elencaTasse: vi.fn(() => of([tassa])),
      creaTassa: vi.fn(() => of(tassa)),
      aggiornaTassa: vi.fn(() => of(tassa)),
      eliminaTassa: vi.fn(() => of(null)),
    };
    return { ...(await apriSezione(TasseSoggiornoComponent, tariffe)), tariffe };
  }

  it('mostra il periodo con l’importo a notte', async () => {
    const { elemento } = await apri();

    const voce = elemento.querySelector('.voce')!.textContent;
    expect(voce).toContain('Tassa 2026');
    expect(voce).toContain('gestionale.tariffe.tasse.aNotte');
  });

  it('il periodo nuovo senza limiti manda null', async () => {
    const { tariffe, scrivi, invia } = await apri();
    await scrivi('nome', 'Tassa 2027');
    await scrivi('valida_dal', '2027-01-01');
    await scrivi('valida_al', '2027-12-31');
    await scrivi('importo_notte', '3');

    await invia();

    expect(tariffe.creaTassa).toHaveBeenCalledWith({
      nome: 'Tassa 2027',
      valida_dal: '2027-01-01',
      valida_al: '2027-12-31',
      importo_notte: 3,
      notti_max: null,
      eta_esenzione: null,
      attiva: true,
    });
  });

  it('l’importo della tassa scelta arriva come testo e torna numero', async () => {
    const { tariffe, campo, scegli, scrivi, invia } = await apri();
    await scegli();
    expect(campo('importo_notte').value).toBe('2.5');

    await scrivi('importo_notte', '2.8');
    await invia();

    expect(tariffe.aggiornaTassa).toHaveBeenCalledWith(1, { importo_notte: 2.8 });
  });
});

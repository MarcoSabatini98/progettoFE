import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { apriSezione } from '../listino-component/sezione-listino-test';
import { CodiciScontoComponent } from './codici-sconto-component';

describe('CodiciScontoComponent', () => {
  const codice = {
    id: 8,
    codice: 'ESTATE26',
    tipo_sconto: 'percentuale',
    valore: '10.00',
    valido_al: '2099-09-30',
    utilizzi_max: 50,
    utilizzi: 12,
    attivo: true,
  };

  async function apri() {
    const tariffe = {
      elencaCodiciSconto: vi.fn(() => of([codice])),
      creaCodiceSconto: vi.fn(() => of(codice)),
      aggiornaCodiceSconto: vi.fn(() => of(codice)),
      eliminaCodiceSconto: vi.fn(() => of(null)),
    };
    return { ...(await apriSezione(CodiciScontoComponent, tariffe)), tariffe };
  }

  it('mostra il codice con scadenza e utilizzi', async () => {
    const { elemento } = await apri();

    const voce = elemento.querySelector('.voce')!.textContent;
    expect(voce).toContain('ESTATE26');
    expect(voce).toContain('gestionale.tariffe.codici.usatiSu');
  });

  it('il codice si scrive in maiuscolo, senza spazi', async () => {
    const { tariffe, campo, scrivi, invia } = await apri();

    await scrivi('codice', ' natale ');
    await scrivi('codice', campo('codice').value, 'blur');
    expect(campo('codice').value).toBe('NATALE');
    await scrivi('valore', '5');
    await invia();

    expect(tariffe.creaCodiceSconto).toHaveBeenCalledWith(
      expect.objectContaining({ codice: 'NATALE', valore: 5, utilizzi_max: null }),
    );
  });

  it('un codice con caratteri non ammessi non si salva', async () => {
    const { tariffe, scrivi, invia } = await apri();

    await scrivi('codice', 'SCONTO 10');
    await scrivi('valore', '5');
    await invia();

    expect(tariffe.creaCodiceSconto).not.toHaveBeenCalled();
  });
});

import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { apriSezione } from '../listino-component/sezione-listino-test';
import { DocumentiLegaliComponent } from './documenti-legali-component';

describe('DocumentiLegaliComponent', () => {
  const bozza = {
    id: 1,
    tipo: 'termini',
    lingua: 'it',
    versione: '2.0',
    contenuto: 'Bozza dei termini',
    pubblicato_il: null,
  };
  const pubblicato = {
    ...bozza,
    id: 2,
    tipo: 'privacy',
    versione: '1.0',
    contenuto: 'Privacy in vigore',
    pubblicato_il: '2026-09-01T10:00:00',
  };
  const contenuti = {
    elencaDocumentiLegali: vi.fn(),
    creaDocumentoLegale: vi.fn(),
    aggiornaDocumentoLegale: vi.fn(),
    eliminaDocumentoLegale: vi.fn(),
    pubblicaDocumentoLegale: vi.fn(),
  };

  beforeEach(() => {
    Object.values(contenuti).forEach((spia) => spia.mockReset());
    contenuti.elencaDocumentiLegali.mockReturnValue(of([pubblicato, bozza]));
    contenuti.creaDocumentoLegale.mockReturnValue(of(bozza));
    contenuti.pubblicaDocumentoLegale.mockReturnValue(
      of({ ...bozza, pubblicato_il: '2026-10-04T09:00:00' }),
    );
  });

  const apri = () =>
    apriSezione(DocumentiLegaliComponent, {}, {}, [
      { provide: ContenutiService, useValue: contenuti },
      {
        provide: LinguaService,
        useValue: { disponibili: signal(['it', 'en']), attiva: signal('it') },
      },
      { provide: AvvisiService, useValue: { mostra: vi.fn() } },
    ]);
  const pulsante = (elemento: HTMLElement, testo: string) =>
    [...elemento.querySelectorAll<HTMLButtonElement>('button')].find((voce) =>
      voce.textContent?.trim().endsWith(testo),
    )!;

  it('nuova bozza: tipo, lingua, versione e testo', async () => {
    const { scrivi, invia } = await apri();
    await scrivi('tipo', 'cookie', 'change');
    await scrivi('lingua', 'en', 'change');
    await scrivi('versione', '1.0');
    await scrivi('contenuto', 'Cookie tecnici');

    await invia();

    expect(contenuti.creaDocumentoLegale).toHaveBeenCalledWith({
      tipo: 'cookie',
      lingua: 'en',
      versione: '1.0',
      contenuto: 'Cookie tecnici',
    });
  });

  it('pubblicato: solo il testo, niente modifica né eliminazione', async () => {
    const { elemento, scegli } = await apri();

    await scegli(0);

    expect(elemento.querySelector('.testo')?.textContent).toBe('Privacy in vigore');
    expect(elemento.querySelector('form')).toBeNull();
    expect(elemento.textContent).not.toContain('gestionale.contenuti.documenti.elimina');
  });

  it('nuova versione: bozza nuova col testo del pubblicato', async () => {
    const { fixture, elemento, scegli, campo } = await apri();
    await scegli(0);

    pulsante(elemento, 'gestionale.contenuti.documenti.nuovaVersione').click();
    await fixture.whenStable();

    expect(campo('tipo').value).toBe('privacy');
    expect(campo('contenuto').value).toBe('Privacy in vigore');
    expect(campo('versione').value).toBe('');
  });

  it('pubblica la bozza solo dopo la conferma', async () => {
    const { fixture, elemento, scegli } = await apri();
    await scegli(1);

    pulsante(elemento, 'gestionale.contenuti.documenti.pubblica').click();
    await fixture.whenStable();
    expect(contenuti.pubblicaDocumentoLegale).not.toHaveBeenCalled();

    pulsante(elemento, 'gestionale.contenuti.documenti.pubblicaConferma').click();
    await fixture.whenStable();

    expect(contenuti.pubblicaDocumentoLegale).toHaveBeenCalledWith(1);
    expect(contenuti.elencaDocumentiLegali).toHaveBeenCalledTimes(2);
    expect(elemento.querySelector('.testo')?.textContent).toBe('Bozza dei termini');
  });
});

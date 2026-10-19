import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FattureService } from '../../../core/services/fatture/fatture-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { MieFattureComponent } from './mie-fatture-component';

describe('MieFattureComponent', () => {
  const fatture = { elencaMie: vi.fn(), scaricaFile: vi.fn() };
  const fattura = {
    id: 5,
    tipo_documento: 'TD01',
    anno: 2026,
    sezionale: '',
    numero: 12,
    data_emissione: '2026-07-04',
    totale: 300,
    prenotazione: { id: 7, codice: 'BB-7' },
  };

  beforeEach(() => {
    Object.values(fatture).forEach((spia) => spia.mockReset());
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:pdf', revokeObjectURL: vi.fn() });
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: FattureService, useValue: fatture },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function crea() {
    const fixture = TestBed.createComponent(MieFattureComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scarica = async () => {
      elemento.querySelector<HTMLButtonElement>('.fattura button')?.click();
      await fixture.whenStable();
    };
    return { elemento, scarica };
  }

  it('elenca le fatture e scarica il PDF col suo numero', async () => {
    fatture.elencaMie.mockReturnValue(of([fattura]));
    fatture.scaricaFile.mockReturnValue(of(new Blob(['%PDF'])));
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { elemento, scarica } = await crea();

    expect(elemento.querySelector('.fattura h3')?.textContent).toContain('portale.fatture.TD01');
    expect(elemento.querySelector('.fattura')?.textContent).toContain('BB-7');
    await scarica();

    expect(fatture.scaricaFile).toHaveBeenCalledWith(5, 'pdf', true);
    expect((clic.mock.contexts[0] as HTMLAnchorElement).download).toBe('2026-12.pdf');
  });

  it('senza fatture lo dice', async () => {
    fatture.elencaMie.mockReturnValue(of([]));

    const { elemento } = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
      'portale.fatture.nessuna',
    );
  });

  it('se il PDF non arriva spiega perché', async () => {
    fatture.elencaMie.mockReturnValue(of([fattura]));
    fatture.scaricaFile.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { errore: { codice: 'FILE_MANCANTE', messaggio: 'PDF non pronto' } },
          }),
      ),
    );
    const { elemento, scarica } = await crea();

    await scarica();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('PDF non pronto');
  });
});

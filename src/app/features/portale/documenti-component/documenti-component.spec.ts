import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { DocumentiComponent } from './documenti-component';

describe('DocumentiComponent', () => {
  const utenti = {
    leggiProfilo: vi.fn(),
    caricaDocumento: vi.fn(),
    scaricaDocumento: vi.fn(),
    eliminaDocumento: vi.fn(),
  };
  const profilo = (documenti: unknown[]) =>
    of({ id: 1, nome: 'Anna', anagrafica: { id: 3, documenti } });
  const carta = { id: 9, nome_originale: 'carta.pdf', caricato_il: '2026-07-04T10:00:00Z' };

  beforeEach(() => {
    Object.values(utenti).forEach((spia) => spia.mockReset());
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: UtentiService, useValue: utenti },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function crea() {
    const fixture = TestBed.createComponent(DocumentiComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLButtonElement>(selettore)?.click();
      await fixture.whenStable();
    };
    return { fixture, elemento, clicca };
  }

  it("carica il file scelto, accetta solo i formati ammessi e ricarica l'elenco", async () => {
    utenti.leggiProfilo.mockReturnValueOnce(profilo([])).mockReturnValueOnce(profilo([carta]));
    utenti.caricaDocumento.mockReturnValue(of(carta));
    const { fixture, elemento } = await crea();
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
      'portale.documenti.nessuno',
    );

    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['%PDF'], 'carta.pdf', { type: 'application/pdf' });
    Object.defineProperty(campo, 'files', { value: [file] });
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(campo.accept).toContain('application/pdf');
    expect(utenti.caricaDocumento).toHaveBeenCalledWith(file);
    expect(elemento.querySelector('.documento .nome')?.textContent).toBe('carta.pdf');
  });

  it('scarica il documento col suo nome', async () => {
    utenti.leggiProfilo.mockReturnValue(profilo([carta]));
    utenti.scaricaDocumento.mockReturnValue(of(new Blob(['%PDF'])));
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:doc', revokeObjectURL: vi.fn() });
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { clicca } = await crea();

    await clicca('.pulsante-secondario');

    expect(utenti.scaricaDocumento).toHaveBeenCalledWith(9);
    expect((clic.mock.contexts[0] as HTMLAnchorElement).download).toBe('carta.pdf');
  });

  it('elimina solo dopo la conferma, e annullare lo lascia', async () => {
    utenti.leggiProfilo.mockReturnValueOnce(profilo([carta])).mockReturnValueOnce(profilo([]));
    utenti.eliminaDocumento.mockReturnValue(of(null));
    const { elemento, clicca } = await crea();

    await clicca('.pulsante-icona');
    await clicca('.pulsante-fantasma:not(.pulsante-icona)');
    expect(elemento.querySelector('.pulsante-pericolo')).toBeNull();
    await clicca('.pulsante-icona');
    await clicca('.pulsante-pericolo');

    expect(utenti.eliminaDocumento).toHaveBeenCalledOnce();
    expect(utenti.eliminaDocumento).toHaveBeenCalledWith(9);
    expect(elemento.querySelector('.documento')).toBeNull();
  });

  it('se il backend rifiuta il file spiega perché', async () => {
    utenti.leggiProfilo.mockReturnValue(profilo([]));
    utenti.caricaDocumento.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 415,
            error: { errore: { codice: 'FORMATO_FILE_NON_VALIDO', messaggio: 'Formato no' } },
          }),
      ),
    );
    const { fixture, elemento } = await crea();

    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(campo, 'files', { value: [new File(['x'], 'x.txt')] });
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Formato no');
  });
});

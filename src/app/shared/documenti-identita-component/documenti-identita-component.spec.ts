import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { DocumentoOspiteInterface } from '../models/documento-ospite/documento-ospite-model';
import { DocumentiIdentitaComponent } from './documenti-identita-component';

describe('DocumentiIdentitaComponent', () => {
  const azioni = { carica: vi.fn(), scarica: vi.fn(), elimina: vi.fn() };
  const carta = {
    id: 9,
    nome_originale: 'carta.pdf',
    caricato_il: '2026-07-04T10:00:00Z',
  } as DocumentoOspiteInterface;

  beforeEach(() => {
    Object.values(azioni).forEach((spia) => spia.mockReset());
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: LinguaService, useValue: { attiva: () => 'it' } }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function crea(documenti: DocumentoOspiteInterface[] = [carta]) {
    const fixture = TestBed.createComponent(DocumentiIdentitaComponent);
    fixture.componentRef.setInput('documenti', documenti);
    fixture.componentRef.setInput('azioni', azioni);
    const cambiati = vi.fn();
    fixture.componentInstance.cambiati.subscribe(cambiati);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLButtonElement>(selettore)?.click();
      await fixture.whenStable();
    };
    const scegliFile = async (file: File) => {
      const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
      Object.defineProperty(campo, 'files', { value: [file] });
      campo.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      return campo;
    };
    return { elemento, clicca, scegliFile, cambiati };
  }

  it('carica il file scelto, accetta solo i formati ammessi e avvisa del cambio', async () => {
    azioni.carica.mockReturnValue(of(carta));
    const { elemento, scegliFile, cambiati } = await crea([]);
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
      'portale.documenti.nessuno',
    );

    const file = new File(['%PDF'], 'carta.pdf', { type: 'application/pdf' });
    const campo = await scegliFile(file);

    expect(campo.accept).toContain('application/pdf');
    expect(azioni.carica).toHaveBeenCalledWith(file);
    expect(cambiati).toHaveBeenCalledOnce();
  });

  it('scarica il documento col suo nome', async () => {
    azioni.scarica.mockReturnValue(of(new Blob(['%PDF'])));
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:doc', revokeObjectURL: vi.fn() });
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { clicca } = await crea();

    await clicca('.pulsante-secondario');

    expect(azioni.scarica).toHaveBeenCalledWith(9);
    expect((clic.mock.contexts[0] as HTMLAnchorElement).download).toBe('carta.pdf');
  });

  it('elimina solo dopo la conferma, e annullare lo lascia', async () => {
    azioni.elimina.mockReturnValue(of(null));
    const { elemento, clicca, cambiati } = await crea();

    await clicca('.pulsante-icona');
    await clicca('.pulsante-fantasma:not(.pulsante-icona)');
    expect(elemento.querySelector('.pulsante-pericolo')).toBeNull();
    await clicca('.pulsante-icona');
    await clicca('.pulsante-pericolo');

    expect(azioni.elimina).toHaveBeenCalledExactlyOnceWith(9);
    expect(cambiati).toHaveBeenCalledOnce();
  });

  it('se il backend rifiuta il file spiega perché', async () => {
    azioni.carica.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 415,
            error: { errore: { codice: 'FORMATO_FILE_NON_VALIDO', messaggio: 'Formato no' } },
          }),
      ),
    );
    const { elemento, scegliFile, cambiati } = await crea([]);

    await scegliFile(new File(['x'], 'x.txt'));

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Formato no');
    expect(cambiati).not.toHaveBeenCalled();
  });
});

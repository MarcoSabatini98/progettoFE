import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  async function crea() {
    const fixture = TestBed.createComponent(DocumentiComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it("carica sul profilo del cliente e ricarica l'elenco", async () => {
    utenti.leggiProfilo.mockReturnValueOnce(profilo([])).mockReturnValueOnce(profilo([carta]));
    utenti.caricaDocumento.mockReturnValue(of(carta));
    const { fixture, elemento } = await crea();

    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['%PDF'], 'carta.pdf', { type: 'application/pdf' });
    Object.defineProperty(campo, 'files', { value: [file] });
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(utenti.caricaDocumento).toHaveBeenCalledWith(file);
    expect(elemento.querySelector('.documento .nome')?.textContent).toBe('carta.pdf');
  });

  it('se il profilo non si carica lo dice', async () => {
    utenti.leggiProfilo.mockReturnValue(throwError(() => new Error('rete')));
    const { elemento } = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
    expect(elemento.querySelector('app-documenti-identita')).toBeNull();
  });
});

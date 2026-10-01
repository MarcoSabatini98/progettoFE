import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { EliminaComponent } from './elimina-component';

describe('EliminaComponent', () => {
  const richiesta = vi.fn();

  beforeEach(() => {
    richiesta.mockReset();
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  async function crea() {
    const fixture = TestBed.createComponent(EliminaComponent);
    fixture.componentRef.setInput('titolo', 'Elimina');
    fixture.componentRef.setInput('aiuto', 'Non si torna indietro');
    fixture.componentRef.setInput('conferma', 'Sì, elimina');
    fixture.componentRef.setInput('richiesta', richiesta);
    const eliminato = vi.fn();
    fixture.componentInstance.eliminato.subscribe(eliminato);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (testo: string) => {
      [...elemento.querySelectorAll<HTMLButtonElement>('button')]
        .find((pulsante) => pulsante.textContent?.includes(testo))!
        .click();
      await fixture.whenStable();
    };
    return { elemento, clicca, eliminato };
  }

  it('chiama il backend solo dopo la conferma', async () => {
    richiesta.mockReturnValue(of(null));
    const { clicca, eliminato } = await crea();

    await clicca('Elimina');
    expect(richiesta).not.toHaveBeenCalled();
    await clicca('Sì, elimina');

    expect(richiesta).toHaveBeenCalledOnce();
    expect(eliminato).toHaveBeenCalledOnce();
  });

  it('se il backend rifiuta spiega perché e richiude la conferma', async () => {
    richiesta.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'IN_USO', messaggio: 'È in uso' } },
          }),
      ),
    );
    const { elemento, clicca, eliminato } = await crea();

    await clicca('Elimina');
    await clicca('Sì, elimina');

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('È in uso');
    expect(elemento.querySelector('.pulsante-pericolo')).toBeNull();
    expect(eliminato).not.toHaveBeenCalled();
  });
});

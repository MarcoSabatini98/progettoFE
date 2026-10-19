import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { RegistraIncassoComponent } from './registra-incasso-component';

describe('RegistraIncassoComponent', () => {
  const pagamenti = { registraPagamento: vi.fn() };

  beforeEach(() => {
    pagamenti.registraPagamento.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: PagamentiService, useValue: pagamenti }],
    });
  });

  async function apri(daPagare: number) {
    const fixture = TestBed.createComponent(RegistraIncassoComponent);
    fixture.componentRef.setInput('prenotazioneId', 7);
    fixture.componentRef.setInput('daPagare', daPagare);
    const registrato = vi.fn();
    fixture.componentInstance.registrato.subscribe(registrato);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    elemento.querySelector('button')?.click();
    await fixture.whenStable();
    const importo = () => elemento.querySelector<HTMLInputElement>('input[type="number"]')!;
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, importo, invia, registrato };
  }

  it('propone quanto resta da pagare e registra un saldo in contanti', async () => {
    pagamenti.registraPagamento.mockReturnValue(of({}));
    const { elemento, importo, invia, registrato } = await apri(148);

    expect(importo().value).toBe('148');
    await invia();

    expect(pagamenti.registraPagamento).toHaveBeenCalledWith(7, {
      tipo: 'saldo',
      metodo: 'contanti',
      importo: 148,
      riferimento: null,
      documento_fiscale: null,
      note: null,
    });
    expect(registrato).toHaveBeenCalled();
    expect(elemento.querySelector('form')).toBeNull();
  });

  it('senza importo non parte nulla', async () => {
    const { elemento, importo, invia } = await apri(0);

    expect(importo().value).toBe('');
    await invia();

    expect(pagamenti.registraPagamento).not.toHaveBeenCalled();
    expect(elemento.querySelector('form')).not.toBeNull();
  });

  it('se il backend rifiuta spiega perché', async () => {
    pagamenti.registraPagamento.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: { errore: { codice: 'IMPORTO_SUPERIORE_AL_SALDO', messaggio: 'Troppo' } },
          }),
      ),
    );
    const { elemento, invia } = await apri(50);

    await invia();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Troppo');
  });
});

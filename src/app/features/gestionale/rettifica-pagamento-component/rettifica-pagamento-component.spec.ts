import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PagamentoInterface } from '../../../shared/models/pagamento/pagamento-model';
import { RettificaPagamentoComponent } from './rettifica-pagamento-component';

describe('RettificaPagamentoComponent', () => {
  const pagamenti = { annullaPagamento: vi.fn(), rimborsaPagamento: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const incasso = { id: 3, metodo: 'contanti', importo: 200 } as PagamentoInterface;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PagamentiService, useValue: pagamenti },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function apri(pagamento: PagamentoInterface = incasso) {
    const fixture = TestBed.createComponent(RettificaPagamentoComponent);
    fixture.componentRef.setInput('pagamento', pagamento);
    const rettificato = vi.fn();
    fixture.componentInstance.rettificato.subscribe(rettificato);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const pulsante = (chiave: string) =>
      [...elemento.querySelectorAll('button')].find((voce) =>
        voce.textContent?.trim().endsWith(chiave),
      );
    const scegli = async (chiave: string) => {
      pulsante(chiave)?.click();
      await fixture.whenStable();
    };
    const scrivi = async (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, pulsante, scegli, scrivi, invia, rettificato };
  }

  it('un incasso online si rimborsa ma non si annulla', async () => {
    const { pulsante } = await apri({ ...incasso, metodo: 'stripe' });

    expect(pulsante('gestionale.rettifica.titoli.rimborsa')).toBeDefined();
    expect(pulsante('gestionale.rettifica.titoli.annulla')).toBeUndefined();
  });

  it('annulla un incasso in struttura con il motivo', async () => {
    pagamenti.annullaPagamento.mockReturnValue(of({}));
    const { elemento, scegli, scrivi, invia, rettificato } = await apri();
    await scegli('gestionale.rettifica.titoli.annulla');
    expect(elemento.querySelector('input[type="number"]')).toBeNull();

    await scrivi('input[type="text"]', 'Registrato due volte');
    await invia();

    expect(pagamenti.annullaPagamento).toHaveBeenCalledWith(3, 'Registrato due volte');
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.rettifica.esiti.annulla', 'successo');
    expect(rettificato).toHaveBeenCalled();
    expect(elemento.querySelector('form')).toBeNull();
  });

  it('rimborso parziale, anche oltre il pagato in più', async () => {
    pagamenti.rimborsaPagamento.mockReturnValue(of({}));
    const { elemento, scegli, scrivi, invia } = await apri();
    await scegli('gestionale.rettifica.titoli.rimborsa');

    await scrivi('input[type="number"]', '50');
    await scrivi('input[type="text"]', 'Gesto commerciale');
    elemento.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    await invia();

    expect(pagamenti.rimborsaPagamento).toHaveBeenCalledWith(3, {
      motivo: 'Gesto commerciale',
      importo: 50,
      forza: true,
    });
  });

  it('senza importo rimborsa tutto; senza motivo non parte nulla', async () => {
    pagamenti.rimborsaPagamento.mockReturnValue(of({}));
    const { scegli, scrivi, invia } = await apri();
    await scegli('gestionale.rettifica.titoli.rimborsa');

    await invia();
    expect(pagamenti.rimborsaPagamento).not.toHaveBeenCalled();

    await scrivi('input[type="text"]', 'Cancellata');
    await invia();
    expect(pagamenti.rimborsaPagamento).toHaveBeenCalledWith(3, {
      motivo: 'Cancellata',
      importo: undefined,
      forza: false,
    });
  });

  it("oltre l'incasso non parte nulla", async () => {
    const { scegli, scrivi, invia } = await apri();
    await scegli('gestionale.rettifica.titoli.rimborsa');

    await scrivi('input[type="number"]', '250');
    await scrivi('input[type="text"]', 'Troppo');
    await invia();

    expect(pagamenti.rimborsaPagamento).not.toHaveBeenCalled();
  });

  it('il rifiuto del backend resta nel modulo', async () => {
    pagamenti.rimborsaPagamento.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422 })),
    );
    const { elemento, scegli, scrivi, invia, rettificato } = await apri();
    await scegli('gestionale.rettifica.titoli.rimborsa');

    await scrivi('input[type="text"]', 'Cancellata');
    await invia();

    expect(elemento.querySelector('[role="alert"]')).not.toBeNull();
    expect(rettificato).not.toHaveBeenCalled();
  });
});

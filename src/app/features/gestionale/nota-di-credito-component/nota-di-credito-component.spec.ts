import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FattureService } from '../../../core/services/fatture/fatture-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { NotaDiCreditoComponent } from './nota-di-credito-component';

describe('NotaDiCreditoComponent', () => {
  const fatture = { creaNotaDiCredito: vi.fn() };
  const nota = { id: 10, tipo_documento: 'TD04' } as FatturaInterface;

  beforeEach(() => {
    fatture.creaNotaDiCredito.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: FattureService, useValue: fatture }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(NotaDiCreditoComponent);
    fixture.componentRef.setInput('fattura', { id: 9 } as FatturaInterface);
    const creata = vi.fn();
    fixture.componentInstance.creata.subscribe(creata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (testo: string) => {
      [...elemento.querySelectorAll<HTMLButtonElement>('button')]
        .find((pulsante) => pulsante.textContent?.includes(testo))!
        .click();
      await fixture.whenStable();
    };
    return { elemento, clicca, creata };
  }

  it('storna tutta la fattura solo dopo la conferma, col motivo', async () => {
    fatture.creaNotaDiCredito.mockReturnValue(of(nota));
    const { elemento, clicca, creata } = await crea();
    const motivo = elemento.querySelector('input')!;
    motivo.value = 'Soggiorno annullato';
    motivo.dispatchEvent(new Event('input'));

    await clicca('gestionale.fatture.nota.storna');
    expect(fatture.creaNotaDiCredito).not.toHaveBeenCalled();
    await clicca('gestionale.fatture.nota.conferma');

    expect(fatture.creaNotaDiCredito).toHaveBeenCalledWith(9, { motivo: 'Soggiorno annullato' });
    expect(creata).toHaveBeenCalledWith(nota);
  });

  it('se il backend rifiuta lo spiega, senza motivo manda null', async () => {
    fatture.creaNotaDiCredito.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { messaggio: 'Non stornabile' } },
          }),
      ),
    );
    const { elemento, clicca, creata } = await crea();

    await clicca('gestionale.fatture.nota.storna');
    await clicca('gestionale.fatture.nota.conferma');

    expect(fatture.creaNotaDiCredito).toHaveBeenCalledWith(9, { motivo: null });
    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Non stornabile');
    expect(creata).not.toHaveBeenCalled();
  });
});

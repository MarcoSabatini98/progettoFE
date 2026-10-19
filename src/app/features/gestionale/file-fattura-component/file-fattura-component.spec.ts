import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { FileFatturaComponent } from './file-fattura-component';

describe('FileFatturaComponent', () => {
  const fatture = { scaricaFile: vi.fn(), rigeneraFile: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const emessa = { id: 9, anno: 2030, sezionale: 'A', numero: 12 } as FatturaInterface;

  beforeEach(() => {
    Object.values(fatture).forEach((spia) => spia.mockReset());
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: FattureService, useValue: fatture },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  async function crea() {
    const fixture = TestBed.createComponent(FileFatturaComponent);
    fixture.componentRef.setInput('fattura', emessa);
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (testo: string) => {
      [...elemento.querySelectorAll<HTMLButtonElement>('button')]
        .find((pulsante) => pulsante.textContent?.includes(testo))!
        .click();
      await fixture.whenStable();
    };
    return { elemento, clicca, aggiornata };
  }

  it("scarica l'XML col nome anno-numero", async () => {
    fatture.scaricaFile.mockReturnValue(of(new Blob(['<xml/>'])));
    // Il router usa ancora URL: si aggiungono solo i metodi del download, che jsdom non ha.
    vi.stubGlobal(
      'URL',
      Object.assign(class extends URL {}, {
        createObjectURL: () => 'blob:f',
        revokeObjectURL: vi.fn(),
      }),
    );
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { clicca } = await crea();

    await clicca('gestionale.fatture.file.xml');

    expect(fatture.scaricaFile).toHaveBeenCalledWith(9, 'xml');
    expect((clic.mock.contexts.at(-1) as HTMLAnchorElement).download).toBe('2030-A12.xml');
  });

  it('rigenera i file e lo dice', async () => {
    fatture.rigeneraFile.mockReturnValue(of(emessa));
    const { clicca, aggiornata } = await crea();

    await clicca('gestionale.fatture.file.rigenera');

    expect(fatture.rigeneraFile).toHaveBeenCalledWith(9);
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.fatture.file.rigenerati', 'successo');
    expect(aggiornata).toHaveBeenCalledWith(emessa);
  });

  it('se il file non arriva lo spiega', async () => {
    fatture.scaricaFile.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 404, error: { errore: { messaggio: 'Manca' } } }),
      ),
    );
    const { elemento, clicca } = await crea();

    await clicca('gestionale.fatture.file.pdf');

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Manca');
  });
});

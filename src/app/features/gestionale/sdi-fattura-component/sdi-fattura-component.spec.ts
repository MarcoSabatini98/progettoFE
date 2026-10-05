import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { SdiFatturaComponent } from './sdi-fattura-component';

describe('SdiFatturaComponent', () => {
  const fatture = { aggiornaSdi: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const emessa = {
    id: 9,
    stato_sdi: 'inviata',
    id_sdi: '12345',
    esito_sdi: null,
  } as unknown as FatturaInterface;

  beforeEach(() => {
    fatture.aggiornaSdi.mockReset();
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: FattureService, useValue: fatture },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SdiFatturaComponent);
    fixture.componentRef.setInput('fattura', emessa);
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, salva, aggiornata };
  }

  it('parte dallo stato della fattura, senza la bozza tra le scelte', async () => {
    const { elemento } = await crea();
    const stato = elemento.querySelector<HTMLSelectElement>('select')!;

    expect(stato.value).toBe('inviata');
    expect([...stato.options].map((o) => o.value)).not.toContain('bozza');
  });

  it("registra l'esito, coi vuoti a null", async () => {
    fatture.aggiornaSdi.mockReturnValue(of({ ...emessa, stato_sdi: 'consegnata' }));
    const { elemento, salva, aggiornata } = await crea();
    const stato = elemento.querySelector<HTMLSelectElement>('select')!;
    stato.value = 'consegnata';
    stato.dispatchEvent(new Event('change'));

    await salva();

    expect(fatture.aggiornaSdi).toHaveBeenCalledWith(9, {
      stato_sdi: 'consegnata',
      id_sdi: '12345',
      esito_sdi: null,
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.fatture.sdi.salvato', 'successo');
    expect(aggiornata).toHaveBeenCalledOnce();
  });

  it('se il backend rifiuta lo spiega', async () => {
    fatture.aggiornaSdi.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errore: { messaggio: 'Stato non valido' } },
          }),
      ),
    );
    const { elemento, salva } = await crea();

    await salva();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Stato non valido');
  });
});

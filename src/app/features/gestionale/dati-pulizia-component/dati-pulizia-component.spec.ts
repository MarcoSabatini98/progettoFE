import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { AttivitaPuliziaInterface } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { DatiPuliziaComponent } from './dati-pulizia-component';

describe('DatiPuliziaComponent', () => {
  const pulizie = { elencaAddetti: vi.fn(), aggiornaAttivita: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const attivita = {
    id: 9,
    assegnata_a: null,
    data_prevista: '2030-06-01',
    tipo: 'partenza',
    priorita: 'normale',
  } as unknown as AttivitaPuliziaInterface;

  beforeEach(() => {
    [...Object.values(pulizie), avvisi.mostra].forEach((spia) => spia.mockReset());
    pulizie.elencaAddetti.mockReturnValue(of([{ id: 3, nome: 'Anna', cognome: 'Bianchi' }]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PulizieService, useValue: pulizie },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(DatiPuliziaComponent);
    fixture.componentRef.setInput('attivita', attivita);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  function assegnaAnna(elemento: HTMLElement): void {
    const addetto = elemento.querySelector('select')!;
    addetto.selectedIndex = 1;
    addetto.dispatchEvent(new Event('change'));
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
  }

  it('assegna l addetto mandando il solo campo cambiato', async () => {
    pulizie.aggiornaAttivita.mockReturnValue(of(attivita));
    const { fixture, elemento } = await crea();
    const salvata = vi.fn();
    fixture.componentInstance.salvata.subscribe(salvata);

    assegnaAnna(elemento);

    expect(pulizie.aggiornaAttivita).toHaveBeenCalledWith(9, { assegnata_a: 3 });
    expect(avvisi.mostra).toHaveBeenCalled();
    expect(salvata).toHaveBeenCalledWith(attivita);
  });

  it('senza modifiche non chiama il backend', async () => {
    const { elemento } = await crea();

    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(pulizie.aggiornaAttivita).not.toHaveBeenCalled();
  });

  it('mostra il motivo del rifiuto', async () => {
    pulizie.aggiornaAttivita.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: {} })),
    );
    const { fixture, elemento } = await crea();

    assegnaAnna(elemento);
    fixture.detectChanges();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

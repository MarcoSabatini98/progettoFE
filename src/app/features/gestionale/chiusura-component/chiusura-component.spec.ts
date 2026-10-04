import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { DataBloccataInterface } from '../../../shared/models/data-bloccata/data-bloccata-model';
import { ChiusuraComponent } from './chiusura-component';

describe('ChiusuraComponent', () => {
  const camere = [{ id: 4, numero: '104' }] as CameraInterface[];
  const scelta = {
    id: 9,
    camera_id: 4,
    data_inizio: '2026-11-02',
    data_fine: '2026-11-05',
    motivo: 'Lavori',
    origine: 'manuale',
  } as DataBloccataInterface;
  const conflitto = {
    id: 3,
    codice: 'BB-3',
    camera_id: 4,
    data_arrivo: '2026-10-10',
    data_partenza: '2026-10-12',
  };
  let calendari: Record<'blocca' | 'aggiornaChiusura' | 'sblocca', ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    calendari = {
      blocca: vi.fn(() => of({ chiusura: scelta, prenotazioni_in_conflitto: [conflitto] })),
      aggiornaChiusura: vi.fn(() => of(scelta)),
      sblocca: vi.fn(() => of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: CalendariService, useValue: calendari }],
    });
  });

  async function crea(chiusura: DataBloccataInterface | null = null) {
    const fixture = TestBed.createComponent(ChiusuraComponent);
    fixture.componentRef.setInput('camere', camere);
    fixture.componentRef.setInput('giorno', '2026-10-10');
    fixture.componentRef.setInput('chiusura', chiusura);
    let cambiate = 0;
    fixture.componentInstance.cambiata.subscribe(() => cambiate++);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    return {
      elemento,
      cambiate: () => cambiate,
      invia: async () => {
        elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
        await fixture.whenStable();
      },
    };
  }

  it('nuova: propone un giorno dal giorno scelto e chiude tutta la struttura', async () => {
    const { elemento, invia, cambiate } = await crea();

    expect(elemento.querySelector('select')!.disabled).toBe(false);
    await invia();

    expect(calendari.blocca).toHaveBeenCalledWith({
      data_inizio: '2026-10-10',
      data_fine: '2026-10-11',
      motivo: null,
      camera_id: null,
    });
    expect(cambiate()).toBe(1);
    expect(elemento.querySelector('.esito-avviso')!.textContent).toContain('BB-3');
  });

  it('scelta: la camera resta quella, si aggiornano date e motivo', async () => {
    const { elemento, invia } = await crea(scelta);

    expect(elemento.querySelector('select')!.disabled).toBe(true);
    await invia();

    expect(calendari.aggiornaChiusura).toHaveBeenCalledWith(9, {
      data_inizio: '2026-11-02',
      data_fine: '2026-11-05',
      motivo: 'Lavori',
    });
  });

  it('riapre la chiusura scelta', async () => {
    const { elemento, cambiate } = await crea(scelta);

    const riapri = Array.from(elemento.querySelectorAll('button')).find((pulsante) =>
      pulsante.textContent!.includes('gestionale.planning.riapri'),
    )!;
    riapri.click();

    expect(calendari.sblocca).toHaveBeenCalledWith(9);
    expect(cambiate()).toBe(1);
  });

  it('un errore del backend resta sotto il modulo', async () => {
    calendari.blocca.mockReturnValue(throwError(() => new Error('no')));
    const { elemento, invia, cambiate } = await crea();

    await invia();

    expect(elemento.querySelector('.esito-errore')).not.toBeNull();
    expect(cambiate()).toBe(0);
  });
});

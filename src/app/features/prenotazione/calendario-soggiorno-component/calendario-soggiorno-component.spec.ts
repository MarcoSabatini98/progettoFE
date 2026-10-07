import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DisponibilitaService } from '../../../core/services/disponibilita/disponibilita-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { FiltriOccupazione } from '../../../shared/models/occupazione-camera/occupazione-camera-model';
import { CalendarioSoggiornoComponent, DateSoggiorno } from './calendario-soggiorno-component';

describe('CalendarioSoggiornoComponent', () => {
  // la 104 è occupata dal 9 al 13 ottobre: notti 9-12, il 13 si riparte
  const occupate = ['2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12'];
  const disponibilita = { leggiOccupazione: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 7, 10));
    disponibilita.leggiOccupazione.mockReset();
    disponibilita.leggiOccupazione.mockReturnValue(of(occupate));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: DisponibilitaService, useValue: disponibilita },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  async function crea(filtri?: FiltriOccupazione, date: Partial<DateSoggiorno> = {}) {
    const fixture = TestBed.createComponent(CalendarioSoggiornoComponent);
    fixture.componentRef.setInput('filtri', filtri);
    fixture.componentRef.setInput('arrivo', date.arrivo ?? '');
    fixture.componentRef.setInput('partenza', date.partenza ?? '');
    const scelte: DateSoggiorno[] = [];
    fixture.componentInstance.scelta.subscribe((scelta) => scelte.push(scelta));
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    /** Giorno di ottobre, il primo mese mostrato. */
    const giorno = (numero: number) =>
      elemento.querySelector('.mese')!.querySelectorAll<HTMLButtonElement>('.giorno')[numero - 1];
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLButtonElement>(selettore)!.click();
      await fixture.whenStable();
    };
    return { elemento, scelte, giorno, clicca };
  }

  it('senza camera né tipologia è neutro: solo i giorni passati sono vietati', async () => {
    const { elemento, giorno } = await crea();

    expect(disponibilita.leggiOccupazione).not.toHaveBeenCalled();
    expect(giorno(6).disabled).toBe(true);
    expect(giorno(7).disabled).toBe(false);
    expect(giorno(10).disabled).toBe(false);
    expect(elemento.querySelector('.libero, .occupato')).toBeNull();
  });

  it('il mese parte dal giorno giusto della settimana (1 ottobre 2026 è giovedì)', async () => {
    const { giorno } = await crea();

    expect(giorno(1).style.gridColumnStart).toBe('4');
  });

  it('notti occupate rosse e non cliccabili, la partenza del 13 è verde', async () => {
    const { elemento, giorno } = await crea({ camera_id: 104 });

    expect(disponibilita.leggiOccupazione).toHaveBeenCalledWith(
      { camera_id: 104 },
      '2026-10-01',
      '2026-12-01',
    );
    for (const numero of [9, 10, 11, 12]) {
      expect(giorno(numero).classList).toContain('occupato');
      expect(giorno(numero).disabled).toBe(true);
    }
    expect(giorno(13).classList).toContain('libero');
    expect(giorno(13).disabled).toBe(false);
    expect(giorno(12).getAttribute('aria-label')).toContain('prenota.calendario.occupato');
    expect(elemento.querySelector('.legenda')).not.toBeNull();
  });

  it('primo clic l’arrivo, secondo la partenza', async () => {
    const { scelte, giorno } = await crea({ camera_id: 104 }, { arrivo: '2026-10-13' });

    giorno(16).click();

    expect(scelte).toEqual([{ arrivo: '2026-10-13', partenza: '2026-10-16' }]);
  });

  it('scelto l’arrivo non si scavalcano le notti occupate', async () => {
    const { scelte, giorno } = await crea({ camera_id: 104 }, { arrivo: '2026-10-07' });

    // si lascia la camera la mattina del 9, quando arriva il prossimo ospite
    expect(giorno(9).disabled).toBe(false);
    expect(giorno(10).disabled).toBe(true);

    giorno(9).click();
    giorno(14).click();

    expect(scelte).toEqual([
      { arrivo: '2026-10-07', partenza: '2026-10-09' },
      { arrivo: '2026-10-14', partenza: '' },
    ]);
  });

  it('evidenzia il soggiorno scelto e ne conta le notti', async () => {
    const { elemento, giorno } = await crea(
      { camera_id: 104 },
      { arrivo: '2026-10-13', partenza: '2026-10-16' },
    );

    expect(giorno(13).classList).toContain('scelto');
    expect(giorno(16).classList).toContain('scelto');
    expect(giorno(14).classList).toContain('in-soggiorno');
    expect(giorno(15).classList).toContain('in-soggiorno');
    expect(giorno(12).disabled).toBe(true);
    expect(elemento.querySelector('.notti')?.textContent).toContain('prenota.calendario.notti');
  });

  it('le frecce cambiano mese, mai prima di quello corrente', async () => {
    const { elemento, clicca } = await crea({ tipologia_id: 2 });

    expect(elemento.querySelector<HTMLButtonElement>('.precedente')!.disabled).toBe(true);

    await clicca('.successivo');

    expect(elemento.querySelector('.mese-titolo')?.textContent).toContain('novembre');
    expect(disponibilita.leggiOccupazione).toHaveBeenLastCalledWith(
      { tipologia_id: 2 },
      '2026-11-01',
      '2027-01-01',
    );
    expect(elemento.querySelector<HTMLButtonElement>('.precedente')!.disabled).toBe(false);
  });
});

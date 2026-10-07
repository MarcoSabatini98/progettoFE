import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DisponibilitaService } from '../../../core/services/disponibilita/disponibilita-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { FiltriDisponibilita } from '../../../shared/models/disponibilita/disponibilita-model';
import { FiltriOccupazione } from '../../../shared/models/occupazione-camera/occupazione-camera-model';
import { CalendarioSoggiornoComponent } from '../calendario-soggiorno-component/calendario-soggiorno-component';
import { RicercaSoggiornoComponent } from './ricerca-soggiorno-component';

describe('RicercaSoggiornoComponent', () => {
  const disponibilita = { leggiOccupazione: vi.fn(() => of<string[]>([])) };

  beforeEach(() => {
    disponibilita.leggiOccupazione.mockClear();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: DisponibilitaService, useValue: disponibilita }],
    });
  });

  async function crea(ospitiMax?: number, occupazione?: FiltriOccupazione) {
    const fixture = TestBed.createComponent(RicercaSoggiornoComponent);
    fixture.componentRef.setInput('ospitiMax', ospitiMax);
    fixture.componentRef.setInput('occupazione', occupazione);
    const ricerche: FiltriDisponibilita[] = [];
    fixture.componentInstance.cerca.subscribe((filtri) => ricerche.push(filtri));
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = async (nome: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(`input[formControlName="${nome}"]`);
      campo!.value = valore;
      campo!.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const calendario = () => fixture.debugElement.query(By.directive(CalendarioSoggiornoComponent));
    const date = async (arrivo: string, partenza = '') => {
      calendario().componentInstance.scelta.emit({ arrivo, partenza });
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, ricerche, scrivi, date, calendario, invia };
  }

  it('cerca con date e adulti, due adulti se non si cambia', async () => {
    const { ricerche, date, invia } = await crea();

    await date('2030-07-01', '2030-07-04');
    await invia();

    expect(ricerche).toEqual([
      { arrivo: '2030-07-01', partenza: '2030-07-04', adulti: 2, bambini: 0, eta_bambini: [] },
    ]);
  });

  it('chiede l’età di ogni bambino prima di cercare', async () => {
    const { elemento, ricerche, scrivi, date, invia } = await crea();
    await date('2030-07-01', '2030-07-04');

    await scrivi('bambini', '2');
    await invia();

    const eta = elemento.querySelectorAll<HTMLSelectElement>('.eta select');
    expect(eta).toHaveLength(2);
    expect(ricerche).toHaveLength(0);

    for (const campo of eta) {
      campo.selectedIndex = 5;
      campo.dispatchEvent(new Event('change'));
    }
    await invia();

    expect(ricerche[0].eta_bambini).toEqual([4, 4]);
  });

  it('non cerca se la partenza non viene dopo l’arrivo', async () => {
    const { elemento, ricerche, date, invia } = await crea();

    await date('2030-07-04', '2030-07-04');
    await invia();

    expect(ricerche).toHaveLength(0);
    expect(elemento.textContent).toContain('moduli.partenzaPrimaArrivo');
  });

  it('con il solo arrivo chiede la partenza e il calendario la riceve', async () => {
    const { elemento, ricerche, date, calendario, invia } = await crea();

    await date('2030-07-04');
    await invia();

    expect(ricerche).toHaveLength(0);
    expect(elemento.querySelector('.campo-errore')?.textContent).toContain('moduli.required');
    expect(calendario().componentInstance.arrivo()).toBe('2030-07-04');
    expect(calendario().componentInstance.partenza()).toBe('');
  });

  it('passa al calendario la camera di cui mostrare le notti occupate', async () => {
    const { calendario } = await crea(undefined, { camera_id: 4 });

    expect(calendario().componentInstance.filtri()).toEqual({ camera_id: 4 });
    expect(disponibilita.leggiOccupazione).toHaveBeenCalled();
  });

  it('una tipologia per una persona riduce i due adulti proposti', async () => {
    const { elemento } = await crea(1);

    const adulti = elemento.querySelector<HTMLInputElement>('input[formControlName="adulti"]')!;
    expect(adulti.value).toBe('1');
    expect(adulti.max).toBe('1');
    expect(elemento.querySelector('input[formControlName="bambini"]')?.getAttribute('max')).toBe(
      '0',
    );
  });

  it('adulti e bambini insieme non superano il tetto', async () => {
    const { elemento, ricerche, scrivi, date, invia } = await crea(3);
    await date('2030-07-01', '2030-07-04');

    await scrivi('bambini', '2');
    for (const campo of elemento.querySelectorAll<HTMLSelectElement>('.eta select')) {
      campo.selectedIndex = 5;
      campo.dispatchEvent(new Event('change'));
    }
    await invia();

    expect(ricerche).toHaveLength(0);
    expect(elemento.textContent).toContain('moduli.max');
    expect(elemento.querySelector('input[formControlName="adulti"]')?.getAttribute('max')).toBe(
      '1',
    );

    await scrivi('bambini', '1');
    elemento.querySelector<HTMLSelectElement>('.eta select')!.selectedIndex = 5;
    elemento.querySelector('.eta select')!.dispatchEvent(new Event('change'));
    await invia();

    expect(ricerche).toHaveLength(1);
  });
});

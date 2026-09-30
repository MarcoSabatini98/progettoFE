import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { FiltriDisponibilita } from '../../../shared/models/disponibilita/disponibilita-model';
import { RicercaSoggiornoComponent } from './ricerca-soggiorno-component';

describe('RicercaSoggiornoComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  async function crea() {
    const fixture = TestBed.createComponent(RicercaSoggiornoComponent);
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
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, ricerche, scrivi, invia };
  }

  it('cerca con date e adulti, due adulti se non si cambia', async () => {
    const { ricerche, scrivi, invia } = await crea();

    await scrivi('arrivo', '2030-07-01');
    await scrivi('partenza', '2030-07-04');
    await invia();

    expect(ricerche).toEqual([
      { arrivo: '2030-07-01', partenza: '2030-07-04', adulti: 2, bambini: 0, eta_bambini: [] },
    ]);
  });

  it('chiede l’età di ogni bambino prima di cercare', async () => {
    const { elemento, ricerche, scrivi, invia } = await crea();
    await scrivi('arrivo', '2030-07-01');
    await scrivi('partenza', '2030-07-04');

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
    const { elemento, ricerche, scrivi, invia } = await crea();

    await scrivi('arrivo', '2030-07-04');
    await scrivi('partenza', '2030-07-04');
    await invia();

    expect(ricerche).toHaveLength(0);
    expect(elemento.textContent).toContain('moduli.partenzaPrimaArrivo');
    expect(elemento.querySelector('input[formControlName="partenza"]')?.getAttribute('min')).toBe(
      '2030-07-05',
    );
  });
});

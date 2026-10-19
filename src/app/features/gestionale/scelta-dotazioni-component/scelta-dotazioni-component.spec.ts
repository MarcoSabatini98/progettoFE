import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { SceltaDotazioniComponent } from './scelta-dotazioni-component';

describe('SceltaDotazioniComponent', () => {
  const camere = { elencaServizi: vi.fn() };

  beforeEach(() => {
    camere.elencaServizi.mockReturnValue(
      of([
        { id: 1, nome: 'Wi-Fi', icona: 'wifi' },
        { id: 2, nome: 'Aria condizionata', icona: null },
      ]),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: CamereService, useValue: camere }],
    });
  });

  async function crea(scelte: number[]) {
    const controllo = new FormControl(scelte, { nonNullable: true });
    const fixture = TestBed.createComponent(SceltaDotazioniComponent);
    fixture.componentRef.setInput('controllo', controllo);
    await fixture.whenStable();
    const caselle = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input'),
    ];
    return { fixture, controllo, caselle };
  }

  it('propone le sole dotazioni attive e spunta quelle già incluse', async () => {
    const { caselle } = await crea([2]);

    expect(camere.elencaServizi).toHaveBeenCalledWith({ tipo: 'dotazione', attivo: true });
    expect(caselle.map((casella) => casella.checked)).toEqual([false, true]);
  });

  it('aggiunge e toglie id dal controllo, che risulta modificato', async () => {
    const { fixture, controllo, caselle } = await crea([2]);

    caselle[0].click();
    caselle[1].click();
    await fixture.whenStable();

    expect(controllo.value).toEqual([1]);
    expect(controllo.dirty).toBe(true);
  });

  it('segue il valore impostato dal modulo', async () => {
    const { fixture, controllo, caselle } = await crea([]);

    controllo.setValue([1, 2]);
    await fixture.whenStable();

    expect(caselle.every((casella) => casella.checked)).toBe(true);
  });
});

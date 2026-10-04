import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ServizioRichiestoPayload } from '../../../shared/models/prenotazione-servizio/prenotazione-servizio-model';
import { ServiziPacchettoComponent } from './servizi-pacchetto-component';

describe('ServiziPacchettoComponent', () => {
  const camere = { elencaServizi: vi.fn() };
  let controllo: FormControl<ServizioRichiestoPayload[]>;

  beforeEach(() => {
    camere.elencaServizi.mockReturnValue(
      of([
        { id: 4, nome: 'Colazione', prezzo: '12.00' },
        { id: 5, nome: 'Parcheggio', prezzo: '8.00' },
      ]),
    );
    controllo = new FormControl([{ servizio_id: 5, quantita: 2 }], { nonNullable: true });
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: CamereService, useValue: camere }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ServiziPacchettoComponent);
    fixture.componentRef.setInput('controllo', controllo);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const spunte = () => elemento.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    const quantita = () => elemento.querySelector<HTMLInputElement>('input[type="number"]')!;
    return { fixture, spunte, quantita };
  }

  it('elenca i soli extra attivi e spunta quelli inclusi con la quantità', async () => {
    const { spunte, quantita } = await crea();

    expect(camere.elencaServizi).toHaveBeenCalledWith({ tipo: 'extra', attivo: true });
    expect(Array.from(spunte()).map((spunta) => spunta.checked)).toEqual([false, true]);
    expect(quantita().value).toBe('2');
  });

  it('un servizio aggiunto parte da 1, tolto sparisce', async () => {
    const { fixture, spunte } = await crea();

    spunte()[0].click();
    await fixture.whenStable();
    expect(controllo.value).toEqual([
      { servizio_id: 5, quantita: 2 },
      { servizio_id: 4, quantita: 1 },
    ]);
    expect(controllo.dirty).toBe(true);

    spunte()[1].click();
    expect(controllo.value).toEqual([{ servizio_id: 4, quantita: 1 }]);
  });

  it('la quantità resta tra 1 e il massimo del backend', async () => {
    const { quantita } = await crea();

    quantita().value = '300';
    quantita().dispatchEvent(new Event('change'));
    expect(controllo.value).toEqual([{ servizio_id: 5, quantita: 255 }]);

    quantita().value = '0';
    quantita().dispatchEvent(new Event('change'));
    expect(controllo.value).toEqual([{ servizio_id: 5, quantita: 1 }]);
  });
});

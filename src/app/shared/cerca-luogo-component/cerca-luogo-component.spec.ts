import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlloggiatiService } from '../../core/services/alloggiati/alloggiati-service';
import { LuogoTrovatoInterface } from '../models/alloggiati-luogo/alloggiati-luogo-model';
import { CercaLuogoComponent } from './cerca-luogo-component';

describe('CercaLuogoComponent', () => {
  const alloggiati = { cercaLuoghi: vi.fn() };
  const roma: LuogoTrovatoInterface = {
    codice: '412058091',
    descrizione: 'ROMA',
    provincia: 'RM',
    tipo: 'comune',
  };

  beforeEach(() => {
    alloggiati.cercaLuoghi.mockReset().mockReturnValue(of([roma]));
    TestBed.configureTestingModule({
      providers: [{ provide: AlloggiatiService, useValue: alloggiati }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(CercaLuogoComponent);
    fixture.componentRef.setInput('etichetta', 'Comune di nascita');
    fixture.componentRef.setInput('tipo', 'comune');
    const scelti: (LuogoTrovatoInterface | null)[] = [];
    fixture.componentInstance.scelto.subscribe((luogo) => scelti.push(luogo));
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = async (testo: string) => {
      const campo = elemento.querySelector('input')!;
      campo.value = testo;
      campo.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    return { elemento, scelti, scrivi };
  }

  it('con meno di due lettere non cerca', async () => {
    const { scrivi } = await crea();

    await scrivi('R');

    expect(alloggiati.cercaLuoghi).not.toHaveBeenCalled();
  });

  it('suggerisce i luoghi trovati con la provincia, collegati al campo', async () => {
    const { elemento, scrivi } = await crea();

    await scrivi('Rom');

    expect(alloggiati.cercaLuoghi).toHaveBeenCalledWith({ cerca: 'Rom', tipo: 'comune' });
    const elenco = elemento.querySelector('datalist')!;
    expect(elemento.querySelector('input')?.getAttribute('list')).toBe(elenco.id);
    expect(elenco.querySelector('option')?.getAttribute('value')).toBe('ROMA (RM)');
  });

  it('emette il luogo scelto tra i suggerimenti e non cerca più', async () => {
    const { scelti, scrivi } = await crea();

    await scrivi('Rom');
    await scrivi('ROMA (RM)');

    expect(scelti).toEqual([null, roma]);
    expect(alloggiati.cercaLuoghi).toHaveBeenCalledTimes(1);
  });

  it('toglie dalla ricerca i caratteri che il backend rifiuta', async () => {
    const { scrivi } = await crea();

    await scrivi('Roma (R');

    expect(alloggiati.cercaLuoghi).toHaveBeenCalledWith({ cerca: 'Roma R', tipo: 'comune' });
  });
});

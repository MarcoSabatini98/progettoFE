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

  async function crea(valore = '') {
    const fixture = TestBed.createComponent(CercaLuogoComponent);
    fixture.componentRef.setInput('etichetta', 'Comune di nascita');
    fixture.componentRef.setInput('valore', valore);
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

  it('mostra il luogo già registrato senza cercarlo', async () => {
    const { elemento } = await crea('ROMA');

    expect(elemento.querySelector('input')!.value).toBe('ROMA');
    expect(alloggiati.cercaLuoghi).not.toHaveBeenCalled();
  });

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

  it('con una data cerca i luoghi in vigore a quella data', async () => {
    const fixture = TestBed.createComponent(CercaLuogoComponent);
    fixture.componentRef.setInput('etichetta', 'Comune di nascita');
    fixture.componentRef.setInput('inVigoreIl', '1950-03-01');
    await fixture.whenStable();
    const campo = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    campo.value = 'Rom';
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(alloggiati.cercaLuoghi).toHaveBeenCalledWith({
      cerca: 'Rom',
      tipo: undefined,
      in_vigore_il: '1950-03-01',
    });
  });

  it('toglie dalla ricerca i caratteri che il backend rifiuta', async () => {
    const { scrivi } = await crea();

    await scrivi('Roma (R');

    expect(alloggiati.cercaLuoghi).toHaveBeenCalledWith({ cerca: 'Roma R', tipo: 'comune' });
  });
});

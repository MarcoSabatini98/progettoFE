import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { BarraGraficoInterface } from '../models/barra-grafico/barra-grafico-model';
import { GraficoBarreComponent } from './grafico-barre-component';

describe('GraficoBarreComponent', () => {
  const barre: BarraGraficoInterface[] = [
    { etichetta: '1', dettaglio: 'giovedì 1 ottobre', valore: 200 },
    { etichetta: '2', dettaglio: 'venerdì 2 ottobre', valore: 400 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(massimo?: number) {
    const fixture = TestBed.createComponent(GraficoBarreComponent);
    fixture.componentRef.setInput('titolo', 'Ricavi');
    fixture.componentRef.setInput('barre', barre);
    fixture.componentRef.setInput('formato', 'prezzo');
    fixture.componentRef.setInput('massimo', massimo);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('parte dalla colonna più alta e le altezze sono in proporzione', async () => {
    const { elemento } = await crea();

    expect(elemento.querySelector('figcaption')!.textContent).toContain('venerdì 2 ottobre');
    expect(elemento.querySelector('figcaption')!.textContent).toContain('400,00');
    const riempimenti = elemento.querySelectorAll<HTMLElement>('.riempimento');
    expect(riempimenti[0].style.blockSize).toBe('50%');
    expect(riempimenti[1].style.blockSize).toBe('100%');
  });

  it('toccando una colonna ne mostra il valore', async () => {
    const { fixture, elemento } = await crea();

    elemento.querySelector<HTMLButtonElement>('.barra')!.click();
    await fixture.whenStable();

    expect(elemento.querySelector('figcaption')!.textContent).toContain('giovedì 1 ottobre');
    expect(elemento.querySelector('.barra')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('con un massimo fisso le colonne sono in scala su quello', async () => {
    const { elemento } = await crea(800);

    expect(elemento.querySelectorAll<HTMLElement>('.riempimento')[1].style.blockSize).toBe('50%');
  });
});

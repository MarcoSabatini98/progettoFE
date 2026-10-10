import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { PaginazioneComponent } from './paginazione-component';

describe('PaginazioneComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [traduzioniTest()] }));

  async function crea(pagina: number, pagine: number, occupato = false) {
    const fixture = TestBed.createComponent(PaginazioneComponent);
    fixture.componentRef.setInput('risultato', { pagina, pagine, totale: pagine * 10 });
    fixture.componentRef.setInput('occupato', occupato);
    fixture.componentRef.setInput('pagina', pagina);
    fixture.componentRef.setInput('perPagina', 10);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const pulsanti = [...elemento.querySelectorAll('button')];
    return { fixture, elemento, pulsanti, componente: fixture.componentInstance };
  }

  it('se le righe stanno nella scelta più piccola non mostra nulla', async () => {
    const fixture = TestBed.createComponent(PaginazioneComponent);
    fixture.componentRef.setInput('risultato', { pagina: 1, pagine: 1, totale: 4 });
    fixture.componentRef.setInput('pagina', 1);
    fixture.componentRef.setInput('perPagina', 5);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.paginazione')).toBeNull();
  });

  it('con una sola pagina mostra solo le righe', async () => {
    const { elemento } = await crea(1, 1);

    expect(elemento.querySelector('select')).not.toBeNull();
    expect(elemento.querySelector('nav')).toBeNull();
  });

  it('sulla prima pagina va solo avanti, e sceglie la pagina dal numero', async () => {
    const { pulsanti, componente } = await crea(1, 3);
    const indietro = pulsanti[0];
    const avanti = pulsanti.at(-1)!;

    expect(indietro.disabled).toBe(true);
    avanti.click();
    expect(componente.pagina()).toBe(2);

    pulsanti.find((pulsante) => pulsante.textContent?.trim() === '3')!.click();
    expect(componente.pagina()).toBe(3);
  });

  it("sull'ultima va solo indietro, e mentre carica aspetta", async () => {
    const ultima = await crea(3, 3);
    expect(ultima.pulsanti.at(-1)!.disabled).toBe(true);
    ultima.pulsanti[0].click();
    expect(ultima.componente.pagina()).toBe(2);

    const { pulsanti } = await crea(2, 3, true);
    expect(pulsanti.every((pulsante) => pulsante.disabled)).toBe(true);
  });

  it('segna la pagina attuale e cambia le righe per pagina', async () => {
    const { elemento, componente } = await crea(2, 3);

    expect(elemento.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('2');
    const scelta = elemento.querySelector('select')!;
    scelta.value = '20';
    scelta.dispatchEvent(new Event('change'));
    expect(componente.perPagina()).toBe(20);
  });
});

import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { PaginazioneComponent } from './paginazione-component';

describe('PaginazioneComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [traduzioniTest()] }));

  async function crea(pagina: number, pagine: number, occupato = false) {
    const fixture = TestBed.createComponent(PaginazioneComponent);
    fixture.componentRef.setInput('risultato', { pagina, pagine });
    fixture.componentRef.setInput('occupato', occupato);
    const sfoglia = vi.fn();
    fixture.componentInstance.sfoglia.subscribe(sfoglia);
    await fixture.whenStable();
    const pulsanti = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    return { pulsanti, sfoglia };
  }

  it('con una sola pagina non mostra nulla', async () => {
    const { pulsanti } = await crea(1, 1);

    expect(pulsanti).toHaveLength(0);
  });

  it('sulla prima pagina va solo avanti', async () => {
    const { pulsanti, sfoglia } = await crea(1, 3);

    expect(pulsanti[0].disabled).toBe(true);
    pulsanti[1].click();
    expect(sfoglia).toHaveBeenCalledWith(1);
  });

  it("sull'ultima va solo indietro, e mentre carica aspetta", async () => {
    const ultima = await crea(3, 3);
    expect(ultima.pulsanti[1].disabled).toBe(true);
    ultima.pulsanti[0].click();
    expect(ultima.sfoglia).toHaveBeenCalledWith(-1);

    const { pulsanti } = await crea(2, 3, true);
    expect([...pulsanti].every((pulsante) => pulsante.disabled)).toBe(true);
  });
});

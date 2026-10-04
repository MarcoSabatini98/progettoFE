import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { Listino } from '../../../core/services/api/listino';
import { AzioniListinoComponent } from './azioni-listino-component';

const voce = { id: 1, nome: 'Estate' };
const richieste = {
  elenca: vi.fn(() => of([voce])),
  crea: vi.fn(),
  aggiorna: vi.fn(),
  elimina: vi.fn(),
};

@Component({
  imports: [ReactiveFormsModule, AzioniListinoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="modulo" (ngSubmit)="listino.salva()">
      <app-azioni-listino [listino]="listino" />
    </form>
  `,
})
class OspiteComponent {
  readonly modulo = new FormGroup({ nome: new FormControl('', { nonNullable: true }) });
  readonly listino = new Listino<typeof voce, unknown>(richieste as never, this.modulo);
}

describe('AzioniListinoComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  async function crea() {
    const fixture = TestBed.createComponent(OspiteComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    return { fixture, elemento, listino: fixture.componentInstance.listino };
  }

  it('senza scelta crea e non offre annulla', async () => {
    const { elemento } = await crea();

    const pulsanti = elemento.querySelectorAll('button');
    expect(pulsanti).toHaveLength(1);
    expect(pulsanti[0].textContent).toContain('gestionale.listino.crea');
  });

  it('con una scelta salva, e annulla la toglie', async () => {
    const { fixture, elemento, listino } = await crea();
    listino.scegli(voce);
    await fixture.whenStable();

    const [salva, annulla] = Array.from(elemento.querySelectorAll('button'));
    expect(salva.textContent).toContain('gestionale.listino.salva');
    annulla.click();
    await fixture.whenStable();

    expect(listino.scelta()).toBeNull();
  });

  it("mostra l'errore e blocca il pulsante durante il salvataggio", async () => {
    const { fixture, elemento, listino } = await crea();
    listino.errore.set('Codice già usato');
    listino.inCorso.set(true);
    await fixture.whenStable();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Codice già usato');
    expect(elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
  });
});

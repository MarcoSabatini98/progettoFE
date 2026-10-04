import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { Listino } from '../../../core/services/api/listino';
import { ListinoComponent } from './listino-component';

interface Voce {
  id: number;
  nome: string;
}

const richieste = {
  elenca: vi.fn(),
  crea: vi.fn(),
  aggiorna: vi.fn(),
  elimina: vi.fn(),
};

@Component({
  imports: [ListinoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-listino [listino]="listino" chiave="prova" [eliminabile]="eliminabile()">
      <ng-template #riga let-voce>{{ voce.nome }}</ng-template>
      <p class="modulo">modulo</p>
    </app-listino>
  `,
})
class OspiteComponent {
  readonly eliminabile = signal(true);
  readonly modulo = new FormGroup({ nome: new FormControl('', { nonNullable: true }) });
  readonly listino = new Listino<Voce, unknown>(richieste as never, this.modulo);
}

describe('ListinoComponent', () => {
  beforeEach(() => {
    richieste.elenca.mockReturnValue(of([{ id: 1, nome: 'Estate' }]));
    richieste.elimina.mockReturnValue(of(null));
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  async function crea() {
    const fixture = TestBed.createComponent(OspiteComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    return { fixture, elemento, voce: () => elemento.querySelector<HTMLButtonElement>('.voce')! };
  }

  it('disegna le voci col template della sezione e proietta il modulo', async () => {
    const { elemento, voce } = await crea();

    expect(voce().textContent).toContain('Estate');
    expect(voce().getAttribute('aria-pressed')).toBe('false');
    expect(elemento.querySelector('.modulo')).not.toBeNull();
    expect(elemento.textContent).toContain('prova.titolo');
  });

  it('la voce scelta si evidenzia e mostra la scheda per eliminarla', async () => {
    const { fixture, elemento, voce } = await crea();

    voce().click();
    await fixture.whenStable();

    expect(voce().getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.modulo.value).toEqual({ nome: 'Estate' });
    expect(elemento.textContent).toContain('prova.elimina');
  });

  it('"nuova" toglie la scelta', async () => {
    const { fixture, elemento, voce } = await crea();
    voce().click();
    await fixture.whenStable();

    elemento.querySelector<HTMLButtonElement>('.intestazione button')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.listino.scelta()).toBeNull();
    expect(elemento.textContent).not.toContain('prova.elimina');
  });

  it('senza voci mostra il testo vuoto', async () => {
    richieste.elenca.mockReturnValue(of([]));
    const { elemento } = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('prova.vuoto');
  });

  it('non eliminabile: la voce scelta non mostra la scheda per eliminarla', async () => {
    const { fixture, elemento, voce } = await crea();
    fixture.componentInstance.eliminabile.set(false);

    voce().click();
    await fixture.whenStable();

    expect(elemento.textContent).not.toContain('prova.elimina');
  });
});

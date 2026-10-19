import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { Listino } from '../../../core/services/api/listino';
import { VOCI_VISIBILI } from '../../../core/services/api/voci-listino';
import { ListinoComponent } from './listino-component';

interface Voce {
  id: number;
  nome: string;
  attivo?: boolean;
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
    <app-listino
      [listino]="listino"
      chiave="prova"
      [eliminabile]="eliminabile()"
      [gruppo]="gruppo()"
      [griglia]="griglia()"
    >
      <ng-template #riga let-voce>{{ voce.nome }}</ng-template>
      <p class="modulo">modulo</p>
    </app-listino>
  `,
})
class OspiteComponent {
  readonly eliminabile = signal(true);
  readonly gruppo = signal<((voce: Voce) => string) | undefined>(undefined);
  readonly griglia = signal(false);
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

  it('con i gruppi divide le voci sotto i titoli, nell’ordine della prima di ciascuno', async () => {
    richieste.elenca.mockReturnValue(
      of([
        { id: 1, nome: 'Wi-Fi' },
        { id: 2, nome: 'Colazione' },
        { id: 3, nome: 'Aria condizionata' },
      ]),
    );
    const { fixture, elemento } = await crea();
    fixture.componentInstance.gruppo.set((voce) => (voce.id === 2 ? 'extra' : 'dotazioni'));
    fixture.componentInstance.griglia.set(true);
    await fixture.whenStable();

    const titoli = [...elemento.querySelectorAll('.gruppo')].map((h3) => h3.textContent?.trim());
    const elenchi = [...elemento.querySelectorAll('.elenco.griglia')];
    expect(titoli).toEqual(['dotazioni', 'extra']);
    expect(elenchi.map((ul) => ul.querySelectorAll('.voce').length)).toEqual([2, 1]);
  });

  describe('liste lunghe', () => {
    const molte = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, nome: `Voce ${i + 1}` }));
    const contaVoci = (elemento: HTMLElement) => elemento.querySelectorAll('.voce').length;

    it('mostra le prime voci, la ricerca e il pulsante per le altre', async () => {
      richieste.elenca.mockReturnValue(of(molte));
      const { fixture, elemento } = await crea();

      expect(contaVoci(elemento)).toBe(VOCI_VISIBILI);
      expect(elemento.querySelector('input[type=search]')).not.toBeNull();
      const altre = elemento.querySelector<HTMLButtonElement>('.altre')!;
      expect(altre.textContent).toContain('gestionale.listino.altre');

      altre.click();
      await fixture.whenStable();

      expect(contaVoci(elemento)).toBe(10);
      expect(elemento.querySelector('.altre')).toBeNull();
    });

    it('la ricerca filtra le voci; senza risultati lo dice', async () => {
      richieste.elenca.mockReturnValue(of(molte));
      const { fixture, elemento } = await crea();
      const cerca = elemento.querySelector<HTMLInputElement>('input[type=search]')!;

      cerca.value = 'voce 10';
      cerca.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(contaVoci(elemento)).toBe(1);

      cerca.value = 'mare';
      cerca.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
        'gestionale.listino.nessuna',
      );
    });

    it('poche voci: niente ricerca né pulsante', async () => {
      const { elemento } = await crea();

      expect(elemento.querySelector('input[type=search]')).toBeNull();
      expect(elemento.querySelector('.altre')).toBeNull();
    });

    it('le disattivate restano nascoste finché non si chiede di vederle', async () => {
      richieste.elenca.mockReturnValue(
        of([
          { id: 1, nome: 'Estate', attivo: true },
          { id: 2, nome: 'Vecchia', attivo: false },
        ]),
      );
      const { fixture, elemento } = await crea();
      expect(contaVoci(elemento)).toBe(1);

      const casella = elemento.querySelector<HTMLInputElement>('.archivio input')!;
      casella.checked = true;
      casella.dispatchEvent(new Event('change'));
      await fixture.whenStable();

      expect(contaVoci(elemento)).toBe(2);
    });
  });
});

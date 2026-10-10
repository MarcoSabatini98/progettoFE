import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CampoComponent } from './campo-component';

@Component({
  imports: [CampoComponent],
  template: `<app-campo etichetta="Email" [aiuto]="aiuto()" [errore]="errore()">
    <input type="email" />
  </app-campo>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OspiteComponent {
  readonly aiuto = signal('La useremo per la conferma');
  readonly errore = signal('');
}

describe('CampoComponent', () => {
  async function crea() {
    const fixture = TestBed.createComponent(OspiteComponent);
    await fixture.whenStable();
    return fixture;
  }

  it("collega l'etichetta al controllo proiettato", async () => {
    const fixture = await crea();
    const etichetta: HTMLLabelElement = fixture.nativeElement.querySelector('label');

    expect(etichetta.textContent).toContain('Email');
    expect(etichetta.control?.tagName).toBe('INPUT');
  });

  it('dà al controllo un id unico, se non ce l’ha', async () => {
    const primo = (await crea()).nativeElement.querySelector('input') as HTMLInputElement;
    const secondo = (await crea()).nativeElement.querySelector('input') as HTMLInputElement;

    expect(primo.id).toMatch(/^campo-\d+$/);
    expect(secondo.id).not.toBe(primo.id);
  });

  it("mostra l'aiuto finché non c'è un errore", async () => {
    const fixture = await crea();
    const nota = () => fixture.nativeElement.querySelector('.campo-nota') as HTMLElement;
    expect(nota().textContent).toContain('La useremo per la conferma');

    fixture.componentInstance.errore.set('Email non valida');
    await fixture.whenStable();

    expect(nota().getAttribute('role')).toBe('alert');
    expect(nota().textContent).toContain('Email non valida');
  });
});

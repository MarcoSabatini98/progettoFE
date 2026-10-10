import { Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';

/**
 * Solo per i test: apre una sezione del listino col TariffeService finto (altri servizi in providers)
 * e dà le mosse dell'utente (scegliere una voce, scrivere in un campo, inviare, vedere le archiviate).
 */
export async function apriSezione<C>(
  componente: Type<C>,
  tariffe: Partial<Record<keyof TariffeService, unknown>>,
  input: Record<string, unknown> = {},
  providers: Provider[] = [],
) {
  TestBed.configureTestingModule({
    imports: [traduzioniTest()],
    providers: [{ provide: TariffeService, useValue: tariffe }, ...providers],
  });
  const fixture = TestBed.createComponent(componente);
  Object.entries(input).forEach(([nome, valore]) => fixture.componentRef.setInput(nome, valore));
  await fixture.whenStable();
  const elemento: HTMLElement = fixture.nativeElement;
  const campo = (nome: string) =>
    elemento.querySelector<HTMLInputElement>(`[formControlName="${nome}"]`)!;
  return {
    fixture,
    elemento,
    campo,
    async scegli(indice = 0) {
      elemento.querySelectorAll<HTMLButtonElement>('.voce')[indice].click();
      await fixture.whenStable();
    },
    async scrivi(nome: string, valore: string, evento = 'input') {
      campo(nome).value = valore;
      campo(nome).dispatchEvent(new Event(evento));
      await fixture.whenStable();
    },
    async mostraArchiviate() {
      const casella = elemento.querySelector<HTMLInputElement>('.archivio input')!;
      casella.checked = true;
      casella.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    },
    async invia() {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    },
  };
}

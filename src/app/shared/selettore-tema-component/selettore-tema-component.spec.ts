import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { PREFERENZE_TEMA } from '../../core/services/tema/tema-costanti';
import { TemaService } from '../../core/services/tema/tema-service';
import { SelettoreTemaComponent } from './selettore-tema-component';

describe('SelettoreTemaComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SelettoreTemaComponent);
    await fixture.whenStable();
    const radio = (): HTMLInputElement[] => [
      ...fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ];
    return { fixture, radio };
  }

  it('offre una scelta per preferenza e segna quella attiva', async () => {
    const { radio } = await crea();

    expect(radio().map((r) => r.value)).toEqual([...PREFERENZE_TEMA]);
    expect(radio().find((r) => r.checked)?.value).toBe('sistema');
  });

  it('applica il tema scelto', async () => {
    const { fixture, radio } = await crea();

    radio()[2].click();
    await fixture.whenStable();

    expect(TestBed.inject(TemaService).preferenza()).toBe('scuro');
    expect(radio()[2].checked).toBe(true);
  });
});

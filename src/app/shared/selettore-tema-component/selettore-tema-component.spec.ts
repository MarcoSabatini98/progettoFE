import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { TemaService } from '../../core/services/tema/tema-service';
import { SelettoreTemaComponent } from './selettore-tema-component';

describe('SelettoreTemaComponent', () => {
  const scuro = signal(false);
  const tema = { scuro, imposta: vi.fn() };

  beforeEach(() => {
    scuro.set(false);
    tema.imposta.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: TemaService, useValue: tema }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SelettoreTemaComponent);
    await fixture.whenStable();
    const radio = (): HTMLInputElement[] => [
      ...fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ];
    return { fixture, radio };
  }

  it('solo chiaro e scuro, segnato quello in uso anche senza una scelta', async () => {
    const { fixture, radio } = await crea();
    expect(radio().map((r) => r.value)).toEqual(['chiaro', 'scuro']);
    expect(radio().find((r) => r.checked)?.value).toBe('chiaro');

    // Dispositivo passato in scuro: l'interruttore lo segue.
    scuro.set(true);
    await fixture.whenStable();
    expect(radio().find((r) => r.checked)?.value).toBe('scuro');
  });

  it('applica il tema scelto', async () => {
    const { radio } = await crea();

    radio()[1].click();

    expect(tema.imposta).toHaveBeenCalledWith('scuro');
  });
});

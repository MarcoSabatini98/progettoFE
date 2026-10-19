import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ComparsaDirective } from './comparsa-directive';

@Component({
  imports: [ComparsaDirective],
  template: '<p appComparsa>Testo</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OspiteComponent {}

@Component({
  imports: [ComparsaDirective],
  template: '<p appComparsa="0px 0px -35% 0px">Testo</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CentroComponent {}

describe('ComparsaDirective', () => {
  let avvisa: IntersectionObserverCallback;
  let opzioni: IntersectionObserverInit | undefined;
  const disconnect = vi.fn();

  beforeEach(() => {
    disconnect.mockClear();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback, init?: IntersectionObserverInit) {
          avvisa = callback;
          opzioni = init;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  function crea(ospite: typeof OspiteComponent = OspiteComponent) {
    const fixture = TestBed.createComponent(ospite);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('p') as HTMLElement;
  }

  const entra = (isIntersecting: boolean, top: number) =>
    avvisa(
      [{ isIntersecting, boundingClientRect: { top } } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

  it('sotto lo schermo resta nascosto', () => {
    const elemento = crea();
    entra(false, 900);

    expect(elemento.classList).toContain('da-comparire');
    expect(elemento.classList).not.toContain('comparso');
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('compare entrando nello schermo e smette di osservare', () => {
    const elemento = crea();
    entra(true, 400);

    expect(elemento.classList).toContain('comparso');
    expect(disconnect).toHaveBeenCalled();
  });

  it('già passato sopra lo schermo è subito visibile', () => {
    const elemento = crea();
    entra(false, -300);

    expect(elemento.classList).toContain('comparso');
  });

  it('senza valore osserva tutto lo schermo, con il valore solo la parte indicata', () => {
    crea();
    expect(opzioni?.rootMargin).toBeUndefined();

    crea(CentroComponent);
    expect(opzioni?.rootMargin).toBe('0px 0px -35% 0px');
  });
});

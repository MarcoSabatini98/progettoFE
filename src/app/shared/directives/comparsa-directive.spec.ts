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

describe('ComparsaDirective', () => {
  let avvisa: IntersectionObserverCallback;
  const disconnect = vi.fn();

  beforeEach(() => {
    disconnect.mockClear();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          avvisa = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  function crea() {
    const fixture = TestBed.createComponent(OspiteComponent);
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
});

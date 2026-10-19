// ============================================================================
// APP - SUITE TEST
// ============================================================================
// Verifica il componente radice: router-outlet per i layout pubblico e
// gestionale, avvisi in sovrimpressione montati una sola volta.
// ============================================================================

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './app';
import { traduzioniTest } from './core/services/lingua/configura-transloco-test';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App, traduzioniTest()],
      providers: [provideRouter([])],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra il router-outlet e gli avvisi', () => {
    const fixture = TestBed.createComponent(App);
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('router-outlet')).not.toBeNull();
    expect(elemento.querySelector('app-avvisi')).not.toBeNull();
  });
});

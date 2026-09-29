// ============================================================================
// APP - SUITE TEST
// ============================================================================
// Verifica il componente radice: per ora contiene solo il router-outlet,
// i layout pubblico e gestionale arriveranno come rotte figlie.
// ============================================================================

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { App } from './app';

describe('App', () => {
  it('should create', () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra il router-outlet', () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});

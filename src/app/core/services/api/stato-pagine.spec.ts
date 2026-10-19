import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { RIGHE_PREDEFINITE, numeriPagina, paginaLocale, statoPagine } from './stato-pagine';

describe('statoPagine', () => {
  it('riparte dalla prima pagina cambiando filtri o righe', () => {
    const filtri = signal('');
    const { pagina, perPagina } = runInInjectionContext(TestBed.inject(Injector), () =>
      statoPagine(filtri),
    );
    expect(perPagina()).toBe(RIGHE_PREDEFINITE);

    pagina.set(3);
    filtri.set('rossi');
    expect(pagina()).toBe(1);

    pagina.set(2);
    perPagina.set(5);
    expect(pagina()).toBe(1);
  });
});

describe('numeriPagina', () => {
  it('poche pagine: tutte', () => {
    expect(numeriPagina(1, 3)).toEqual([1, 2, 3]);
  });

  it('tante pagine: prima, ultima, vicine e puntini', () => {
    expect(numeriPagina(5, 9)).toEqual([1, null, 4, 5, 6, null, 9]);
    expect(numeriPagina(1, 8)).toEqual([1, 2, null, 8]);
    expect(numeriPagina(8, 8)).toEqual([1, null, 7, 8]);
  });
});

describe('paginaLocale', () => {
  it('taglia la pagina chiesta e conta le pagine', () => {
    expect(paginaLocale([1, 2, 3, 4, 5, 6, 7], 2, 5)).toEqual({
      elementi: [6, 7],
      totale: 7,
      pagina: 2,
      perPagina: 5,
      pagine: 2,
    });
  });
});

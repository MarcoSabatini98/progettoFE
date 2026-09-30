import { ApplicationRef, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { accodaPagine } from './pagine-accodate';

describe('accodaPagine', () => {
  const pagina = (numero: number, elementi: string[]) =>
    of({ elementi, totale: 3, pagina: numero, perPagina: 2, pagine: 2 });

  it('accoda le pagine e dice quando sono finite', async () => {
    const carica = vi
      .fn()
      .mockReturnValueOnce(pagina(1, ['a', 'b']))
      .mockReturnValueOnce(pagina(2, ['c']));
    const elenco = runInInjectionContext(TestBed.inject(Injector), () => accodaPagine(carica, 2));

    await TestBed.inject(ApplicationRef).whenStable();
    expect(carica).toHaveBeenCalledWith({ pagina: 1, perPagina: 2 });
    expect(elenco.mostrate()).toEqual(['a', 'b']);
    expect(elenco.altre()).toBe(true);

    elenco.mostraAltre();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(carica).toHaveBeenLastCalledWith({ pagina: 2, perPagina: 2 });
    expect(elenco.mostrate()).toEqual(['a', 'b', 'c']);
    expect(elenco.altre()).toBe(false);
  });
});

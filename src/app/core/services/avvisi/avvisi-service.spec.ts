import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DURATA_AVVISO_MS } from './avvisi-costanti';
import { AvvisiService } from './avvisi-service';

describe('AvvisiService', () => {
  let service: AvvisiService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(AvvisiService);
  });

  afterEach(() => vi.useRealTimers());

  it('mostra gli avvisi in ordine, di tipo info se non indicato', () => {
    service.mostra('Primo');
    service.mostra('Secondo', 'errore');

    expect(service.avvisi().map((avviso) => [avviso.testo, avviso.tipo])).toEqual([
      ['Primo', 'info'],
      ['Secondo', 'errore'],
    ]);
  });

  it('chiude un avviso da solo dopo la durata prevista', () => {
    service.mostra('Salvato', 'successo');

    vi.advanceTimersByTime(DURATA_AVVISO_MS - 1);
    expect(service.avvisi()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.avvisi()).toHaveLength(0);
  });

  it("chiude solo l'avviso scelto", () => {
    service.mostra('Primo');
    service.mostra('Secondo');

    service.chiudi(service.avvisi()[0].id);

    expect(service.avvisi().map((avviso) => avviso.testo)).toEqual(['Secondo']);
  });
});

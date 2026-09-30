import { computed, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import {
  PaginaInterface,
  ParametriPaginaInterface,
} from '../../../shared/models/pagina/pagina-model';

/**
 * Elenco paginato con "mostra altri": le pagine arrivate si accodano e,
 * mentre la successiva carica, restano quelle già viste.
 * Va creato nel costruttore o tra i campi del componente (usa rxResource).
 */
export function accodaPagine<T>(
  carica: (parametri: ParametriPaginaInterface) => Observable<PaginaInterface<T>>,
  perPagina: number,
) {
  const pagina = signal(1);
  const risorsa = rxResource({
    params: () => ({ pagina: pagina(), perPagina }),
    stream: ({ params }) => carica(params),
  });
  const mostrate = linkedSignal<PaginaInterface<T> | undefined, T[]>({
    source: () => (risorsa.hasValue() ? risorsa.value() : undefined),
    computation: (arrivata, precedente) => {
      const giaViste = precedente?.value ?? [];
      return arrivata ? [...giaViste, ...arrivata.elementi] : giaViste;
    },
  });
  const altre = computed(
    () => risorsa.hasValue() && risorsa.value().pagina < risorsa.value().pagine,
  );
  return { risorsa, mostrate, altre, mostraAltre: () => pagina.update((numero) => numero + 1) };
}

import { linkedSignal, signal } from '@angular/core';

import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';

/** Righe per pagina che si possono scegliere negli elenchi del gestionale. */
export const RIGHE_PER_PAGINA = [5, 10, 20] as const;
export const RIGHE_PREDEFINITE = 10;

/**
 * Pagina e righe per pagina di un elenco: cambiando filtri o righe si riparte
 * dalla prima. Va creato tra i campi del componente.
 */
export function statoPagine(filtri: () => unknown = () => null, righe: number = RIGHE_PREDEFINITE) {
  const perPagina = signal(righe);
  const pagina = linkedSignal({
    source: () => ({ filtri: filtri(), perPagina: perPagina() }),
    computation: () => 1,
  });
  return { pagina, perPagina };
}

/**
 * Numeri da mostrare: prima, ultima e le vicine a quella attuale;
 * null dove ne mancano (i puntini).  (5, 9) → [1, null, 4, 5, 6, null, 9]
 */
export function numeriPagina(attuale: number, pagine: number): (number | null)[] {
  const scelte = [...new Set([1, attuale - 1, attuale, attuale + 1, pagine])]
    .filter((numero) => numero >= 1 && numero <= pagine)
    .sort((a, b) => a - b);
  return scelte.flatMap((numero, indice) =>
    indice > 0 && numero - scelte[indice - 1] > 1 ? [null, numero] : [numero],
  );
}

/** Una pagina di un elenco già tutto in memoria, nella stessa forma di quelli dell'API. */
export function paginaLocale<T>(
  elementi: readonly T[],
  pagina: number,
  perPagina: number,
): PaginaInterface<T> {
  const inizio = (pagina - 1) * perPagina;
  return {
    elementi: elementi.slice(inizio, inizio + perPagina),
    totale: elementi.length,
    pagina,
    perPagina,
    pagine: Math.ceil(elementi.length / perPagina),
  };
}

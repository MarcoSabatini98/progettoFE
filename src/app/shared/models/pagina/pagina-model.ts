/** Elenco paginato dell'API (?pagina=1&perPagina=20, massimo 100 per pagina). */
export interface PaginaInterface<T> {
  elementi: T[];
  totale: number;
  pagina: number;
  perPagina: number;
  pagine: number;
}

/** Parametri di paginazione da mandare all'API. */
export interface ParametriPaginaInterface {
  pagina?: number;
  perPagina?: number;
}

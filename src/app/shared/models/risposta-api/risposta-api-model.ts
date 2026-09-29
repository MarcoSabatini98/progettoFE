/** Risposta di successo dell'API: { successo: true, dati } */
export interface RispostaApiInterface<T> {
  successo: true;
  dati: T;
}

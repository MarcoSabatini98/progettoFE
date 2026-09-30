/** Punti di un cliente in un anno. */
export interface StatisticheFedeltaInterface {
  anno: number;
  punti_guadagnati: number;
  /** Somma dei movimenti negativi, come numero positivo. */
  punti_tolti: number;
}

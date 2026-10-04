/** Una barra di un grafico: etichetta corta sotto la barra, dettaglio per esteso quando la si sceglie. */
export interface BarraGraficoInterface {
  etichetta: string;
  dettaglio: string;
  valore: number;
}

/** Come scrivere i valori: importo nella valuta della struttura o percentuale. */
export type FormatoGrafico = 'prezzo' | 'percentuale';

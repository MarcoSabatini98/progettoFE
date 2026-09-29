/** Domanda frequente. domanda e risposta arrivano già tradotte nella lingua richiesta. */
export interface FaqInterface {
  id: number;
  domanda: string;
  risposta: string;
  categoria: string | null;
  ordine: number;
  pubblicata: boolean;
  creato_da: number | null;
  aggiornato_da: number | null;
  creato_il: string;
  aggiornato_il: string;
}

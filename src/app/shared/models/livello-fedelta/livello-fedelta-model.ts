/** Livello del programma fedeltà (bronze → diamond): si raggiunge con i punti e dà uno sconto. */
export interface LivelloFedeltaInterface {
  id: number;
  codice: string;
  nome: string;
  punti_minimi: number;
  sconto_percentuale: number;
  /** Colore esadecimale del badge (es. '#cd7f32'). */
  colore: string | null;
}

/** codice: minuscole, cifre, _ e -. */
export type LivelloFedeltaCreaPayload = Pick<
  LivelloFedeltaInterface,
  'codice' | 'nome' | 'punti_minimi'
> &
  Partial<Pick<LivelloFedeltaInterface, 'sconto_percentuale' | 'colore'>>;

export type LivelloFedeltaAggiornaPayload = Partial<LivelloFedeltaCreaPayload>;

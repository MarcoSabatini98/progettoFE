/** Riga di una fattura. Il prezzo unitario è imponibile, IVA esclusa. */
export interface FatturaRigaInterface {
  id: number;
  fattura_id: number;
  descrizione: string;
  quantita: number;
  prezzo_unitario: number;
  aliquota_iva: number;
  /** Natura dell'operazione (es. N1), obbligatoria con aliquota 0. */
  natura: string | null;
  totale: number | null;
  ordine: number;
}

/** Prezzo negativo ammesso: righe di sconto. */
export type RigaFatturaPayload = Pick<
  FatturaRigaInterface,
  'descrizione' | 'prezzo_unitario' | 'aliquota_iva'
> &
  Partial<Pick<FatturaRigaInterface, 'quantita' | 'natura'>>;

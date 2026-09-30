import { CodiceRuolo } from '../ruolo/ruolo-model';

/** Coppia di ruoli che possono scriversi in chat (vale nei due sensi). */
export interface RegolaChatInterface {
  ruolo_a: CodiceRuolo;
  ruolo_b: CodiceRuolo;
}

/** Due ruoli che possono scriversi, in qualunque ordine. */
export type CoppiaRuoli = [CodiceRuolo, CodiceRuolo];

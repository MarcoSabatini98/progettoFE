import type { TIPI_AVVISO } from '../../../core/services/avvisi/avvisi-costanti';

export type TipoAvviso = (typeof TIPI_AVVISO)[number];

/** Messaggio breve in sovrimpressione (toast), già tradotto. */
export interface AvvisoInterface {
  id: number;
  testo: string;
  tipo: TipoAvviso;
}

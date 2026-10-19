import type { TIPI_CONSENSO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { DocumentoLegaleInterface } from '../documento-legale/documento-legale-model';

export type TipoConsenso = (typeof TIPI_CONSENSO)[number];

/** Consenso dato (o negato) da un utente, visitatore o ospite a una versione di un documento. */
export interface ConsensoInterface {
  id: number;
  utente_id: number | null;
  visitatore_id: number | null;
  ospite_id: number | null;
  documento_id: number | null;
  tipo: TipoConsenso;
  accettato: boolean;
  creato_il: string;

  // ─── Associazioni ───
  documento?: DocumentoLegaleInterface | null;
}

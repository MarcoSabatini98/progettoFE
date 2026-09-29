import type { TIPI_DOCUMENTO_LEGALE } from '../../../core/services/sistema/sistema-costanti';
import { Lingua } from '../lingua/lingua-model';

export type TipoDocumentoLegale = (typeof TIPI_DOCUMENTO_LEGALE)[number];

/** Privacy, termini o cookie policy in una versione e lingua. */
export interface DocumentoLegaleInterface {
  id: number;
  tipo: TipoDocumentoLegale;
  versione: string;
  lingua: Lingua;
  contenuto: string | null;
  percorso_pdf: string | null;
  /** null = bozza non ancora pubblicata. */
  pubblicato_il: string | null;
  creato_da: number | null;
  creato_il: string;
}

import type { TIPI_VARIAZIONE_PIANO } from '../../../core/services/tariffe/tariffe-costanti';

export type TipoVariazionePiano = (typeof TIPI_VARIAZIONE_PIANO)[number];

/**
 * Piano tariffario (es. "Non rimborsabile -10%", "Flessibile"): variazione di prezzo,
 * politica di cancellazione e acconto. Alla prenotazione la politica viene copiata.
 */
export interface PianoTariffarioInterface {
  id: number;
  nome: string;
  descrizione: string | null;
  tipo_variazione: TipoVariazionePiano;
  valore_variazione: number;
  rimborsabile: boolean;
  ore_cancellazione_gratuita: number;
  penale_percentuale: number;
  acconto_percentuale: number;
  predefinito: boolean;
  /** Colonna generata dal database: si legge, non si scrive. */
  predefinito_unico: number | null;
  attivo: boolean;
  ordine: number;
  creato_il: string;
  aggiornato_il: string;
}

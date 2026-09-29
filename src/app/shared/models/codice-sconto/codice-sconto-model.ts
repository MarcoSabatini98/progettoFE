import { TipoSconto } from '../promozione/promozione-model';

/** Codice che il cliente inserisce alla prenotazione (es. ESTATE10). */
export interface CodiceScontoInterface {
  id: number;
  codice: string;
  descrizione: string | null;
  tipo_sconto: TipoSconto;
  valore: number;
  valido_dal: string | null;
  valido_al: string | null;
  importo_minimo: number | null;
  notti_min: number | null;
  utilizzi_max: number | null;
  utilizzi_per_utente: number | null;
  utilizzi: number;
  attivo: boolean;
  creato_da: number | null;
  creato_il: string;
  aggiornato_il: string;
}

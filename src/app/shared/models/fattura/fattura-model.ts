import type {
  STATI_SDI,
  TIPI_DOCUMENTO_FATTURA,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { FatturaRigaInterface } from '../fattura-riga/fattura-riga-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

export type TipoDocumentoFattura = (typeof TIPI_DOCUMENTO_FATTURA)[number];
export type StatoSdi = (typeof STATI_SDI)[number];

/**
 * Fattura elettronica (TD01) o nota di credito (TD04). Nasce in bozza senza numero:
 * anno e numero arrivano al passaggio a 'da_inviare'. I dati del cliente sono copiati.
 */
export interface FatturaInterface {
  id: number;
  prenotazione_id: number | null;
  /** Fattura stornata da questa nota di credito. */
  fattura_origine_id: number | null;
  tipo_documento: TipoDocumentoFattura;
  anno: number | null;
  sezionale: string;
  numero: number | null;
  /** 'YYYY-MM-DD' */
  data_emissione: string;
  cliente_denominazione: string | null;
  cliente_nome: string | null;
  cliente_cognome: string | null;
  cliente_codice_fiscale: string | null;
  cliente_partita_iva: string | null;
  cliente_indirizzo: string;
  cliente_cap: string;
  cliente_comune: string;
  cliente_provincia: string | null;
  cliente_nazione: string;
  codice_destinatario: string;
  pec: string | null;
  imponibile: number;
  imposta: number;
  importo_esente: number;
  totale: number;
  stato_sdi: StatoSdi;
  id_sdi: string | null;
  nome_file_xml: string | null;
  percorso_xml: string | null;
  percorso_pdf: string | null;
  esito_sdi: string | null;
  note: string | null;
  creato_da: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  righe?: FatturaRigaInterface[];
  prenotazione?: PrenotazioneInterface | null;
}

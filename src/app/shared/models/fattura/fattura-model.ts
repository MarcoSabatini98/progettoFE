import type {
  STATI_SDI,
  TIPI_DOCUMENTO_FATTURA,
  TIPI_FILE_FATTURA,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { FatturaRigaInterface, RigaFatturaPayload } from '../fattura-riga/fattura-riga-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

export type TipoDocumentoFattura = (typeof TIPI_DOCUMENTO_FATTURA)[number];
export type StatoSdi = (typeof STATI_SDI)[number];
export type TipoFileFattura = (typeof TIPI_FILE_FATTURA)[number];

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

/**
 * Intestatario diverso dal titolare: privato (nome, cognome, codice fiscale)
 * o azienda (denominazione, partita IVA).
 */
export interface DatiClienteFatturaPayload {
  denominazione?: string | null;
  nome?: string | null;
  cognome?: string | null;
  codice_fiscale?: string | null;
  partita_iva?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  comune?: string | null;
  provincia?: string | null;
  /** ISO 3166-1 alpha-2 */
  nazione?: string;
  /** '0000000' = cassetto fiscale o PEC. */
  codice_destinatario?: string;
  pec?: string | null;
}

/** Le righe sostituiscono quelle della bozza. */
export interface FatturaAggiornaPayload {
  cliente?: DatiClienteFatturaPayload;
  note?: string | null;
  righe?: RigaFatturaPayload[];
}

/** Senza righe la nota storna tutta la fattura. */
export interface NotaDiCreditoPayload {
  motivo?: string | null;
  righe?: RigaFatturaPayload[];
}

/** Esito dello SDI registrato a mano. */
export type EsitoSdiPayload = Pick<FatturaInterface, 'stato_sdi'> &
  Partial<Pick<FatturaInterface, 'id_sdi' | 'esito_sdi'>>;

export interface FiltriFatture extends ParametriPaginaInterface {
  stato_sdi?: StatoSdi[];
  anno?: number;
  prenotazione_id?: number;
  /** Denominazione, cognome, codice fiscale o partita IVA. */
  cerca?: string;
}

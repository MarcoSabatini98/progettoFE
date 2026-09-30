import type {
  CANALI,
  STATI_PRENOTAZIONE,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CameraInterface } from '../camera/camera-model';
import { CodiceScontoInterface } from '../codice-sconto/codice-sconto-model';
import { DettaglioPrezzoInterface } from '../dettaglio-prezzo/dettaglio-prezzo-model';
import { InvioAlloggiatiInterface } from '../invio-alloggiati/invio-alloggiati-model';
import { OspiteCreaPayload, OspiteInterface } from '../ospite/ospite-model';
import { PacchettoInterface } from '../pacchetto/pacchetto-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
import { PagamentoInterface } from '../pagamento/pagamento-model';
import { FiltriPeriodo } from '../periodo/periodo-model';
import { PianoTariffarioInterface } from '../piano-tariffario/piano-tariffario-model';
import { PreventivoPayload } from '../preventivo/preventivo-model';
import { PrenotazioneOspiteInterface } from '../prenotazione-ospite/prenotazione-ospite-model';
import { PrenotazioneServizioInterface } from '../prenotazione-servizio/prenotazione-servizio-model';
import { SaldoPrenotazioneInterface } from '../saldo-prenotazione/saldo-prenotazione-model';
import { UtenteInterface } from '../utente/utente-model';

export type StatoPrenotazione = (typeof STATI_PRENOTAZIONE)[number];
export type Canale = (typeof CANALI)[number];

/**
 * Soggiorno in una camera. Gli importi sono fotografati dal preventivo;
 * totale e notti li calcola il database.
 */
export interface PrenotazioneInterface {
  id: number;
  uuid: string;
  codice: string;
  /** Titolare: l'ospite a cui è intestata. */
  ospite_id: number;
  utente_id: number | null;
  camera_id: number;
  piano_tariffario_id: number | null;
  promozione_id: number | null;
  codice_sconto_id: number | null;
  pacchetto_id: number | null;
  /** 'YYYY-MM-DD' */
  data_arrivo: string;
  /** 'YYYY-MM-DD', giorno del check-out (notte esclusa). */
  data_partenza: string;
  notti: number | null;
  adulti: number;
  bambini: number;
  stato: StatoPrenotazione;
  canale: Canale;
  id_esterno: string | null;
  valuta: string;
  importo_soggiorno: number;
  sconto_promozione: number;
  sconto_codice: number;
  percentuale_fedelta: number;
  sconto_fedelta: number;
  importo_pacchetto: number;
  importo_servizi: number;
  tassa_soggiorno: number;
  totale: number | null;
  acconto_richiesto: number;
  dettaglio_prezzo: DettaglioPrezzoInterface | null;
  rimborsabile: boolean;
  ore_cancellazione_gratuita: number;
  penale_percentuale: number;
  richieste_speciali: string | null;
  /** Assente nella versione per il cliente. */
  note_interne?: string | null;
  /** 'HH:mm:ss' */
  ora_arrivo_prevista: string | null;
  /** Scadenza delle prenotazioni in attesa di pagamento. */
  scade_il: string | null;
  /** Scadenza del link di check-in online; assente nella versione per il cliente. */
  token_checkin_scade_il?: string | null;
  checkin_online_il: string | null;
  arrivo_effettivo_il: string | null;
  partenza_effettiva_il: string | null;
  cancellata_il: string | null;
  motivo_cancellazione: string | null;
  penale_applicata: number;
  /** Assente nella versione per il cliente. */
  creato_da?: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  titolare?: OspiteInterface;
  camera?: CameraInterface;
  saldo?: SaldoPrenotazioneInterface | null;
  righe_ospiti?: PrenotazioneOspiteInterface[];
  righe_servizi?: PrenotazioneServizioInterface[];
  pagamenti?: PagamentoInterface[];
  piano_tariffario?: PianoTariffarioInterface | null;
  codice_sconto?: CodiceScontoInterface | null;
  pacchetto?: PacchettoInterface | null;
  autore?: UtenteInterface | null;
  invii_alloggiati?: InvioAlloggiatiInterface[];
}

/**
 * Online serve la sessione del blocco, lo staff indica camera_id.
 * I campi dello staff il backend li ignora per clienti e visitatori.
 */
export interface PrenotazioneCreaPayload extends Omit<PreventivoPayload, 'tipologia_id'> {
  sessione?: string;
  camera_id?: number;
  /** Chi prenota senza account. */
  titolare?: OspiteCreaPayload;
  richieste_speciali?: string | null;
  /** 'HH:mm' */
  ora_arrivo_prevista?: string | null;

  // ─── Solo staff ───
  utente_id?: number;
  canale?: Canale;
  id_esterno?: string | null;
  stato?: Extract<StatoPrenotazione, 'in_attesa' | 'confermata'>;
  note_interne?: string | null;
}

export type PrenotazioneAggiornaPayload = Partial<
  Pick<
    PrenotazioneInterface,
    | 'camera_id'
    | 'data_arrivo'
    | 'data_partenza'
    | 'adulti'
    | 'bambini'
    | 'note_interne'
    | 'richieste_speciali'
    | 'ora_arrivo_prevista'
  >
>;

export interface CancellazionePayload {
  motivo?: string | null;
  /** Solo staff: sostituisce la penale calcolata. */
  penale?: number | null;
}

/** Chi ha prenotato senza account ritrova la prenotazione con codice ed email. */
export type AccessoPerCodicePayload = Pick<PrenotazioneInterface, 'codice'> & {
  email: string;
};

export interface FiltriPrenotazioni extends ParametriPaginaInterface, FiltriPeriodo {
  stato?: StatoPrenotazione[];
  canale?: Canale;
  camera_id?: number;
  /** Codice, cognome o email del titolare. */
  cerca?: string;
  /** Per data di arrivo. */
  ordine?: 'asc' | 'desc';
}

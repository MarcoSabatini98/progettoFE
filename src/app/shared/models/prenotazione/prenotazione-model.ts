import type {
  CANALI,
  STATI_PRENOTAZIONE,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CameraInterface } from '../camera/camera-model';
import { CodiceScontoInterface } from '../codice-sconto/codice-sconto-model';
import { DettaglioPrezzoInterface } from '../dettaglio-prezzo/dettaglio-prezzo-model';
import { InvioAlloggiatiInterface } from '../invio-alloggiati/invio-alloggiati-model';
import { OspiteInterface } from '../ospite/ospite-model';
import { PacchettoInterface } from '../pacchetto/pacchetto-model';
import { PagamentoInterface } from '../pagamento/pagamento-model';
import { PianoTariffarioInterface } from '../piano-tariffario/piano-tariffario-model';
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

import { DettaglioPrezzoInterface } from '../dettaglio-prezzo/dettaglio-prezzo-model';
import { PianoTariffarioInterface } from '../piano-tariffario/piano-tariffario-model';
import {
  PrenotazioneServizioInterface,
  ServizioRichiestoPayload,
} from '../prenotazione-servizio/prenotazione-servizio-model';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

/** Extra nel preventivo, col prezzo di oggi. */
export type ServizioPreventivoInterface = Omit<
  PrenotazioneServizioInterface,
  'prenotazione_id' | 'servizio'
> & {
  nome: string;
};

/** Politica del piano scelto, mostrata prima di prenotare. */
export type PianoPreventivoInterface = Pick<
  PianoTariffarioInterface,
  | 'id'
  | 'nome'
  | 'rimborsabile'
  | 'ore_cancellazione_gratuita'
  | 'penale_percentuale'
  | 'acconto_percentuale'
>;

/** Prezzo calcolato per un soggiorno: notte per notte, sconti, extra, tassa e acconto. */
export interface PreventivoInterface extends DettaglioPrezzoInterface {
  numero_notti: number;
  importo_soggiorno: number;
  sconto_promozione: number;
  sconto_codice: number;
  percentuale_fedelta: number;
  sconto_fedelta: number;
  importo_pacchetto: number;
  servizi: ServizioPreventivoInterface[];
  importo_servizi: number;
  tassa_soggiorno: number;
  totale: number;
  acconto_richiesto: number;
  tipologia: Pick<TipologiaCameraInterface, 'id' | 'nome'>;
  piano: PianoPreventivoInterface | null;
}

/** Chi soggiorna: l'età dei bambini serve per l'esenzione dalla tassa di soggiorno. */
export interface OspitiPayload {
  adulti: number;
  bambini?: number;
  eta_bambini?: number[];
}

export interface PreventivoPayload extends OspitiPayload {
  tipologia_id: number;
  /** AAAA-MM-GG */
  arrivo: string;
  /** AAAA-MM-GG */
  partenza: string;
  piano_id?: number;
  codice_sconto?: string;
  pacchetto_id?: number;
  servizi?: ServizioRichiestoPayload[];
}

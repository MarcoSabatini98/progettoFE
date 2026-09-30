import { ErroreApiInterface } from '../errore-api/errore-api-model';
import { OspitiPayload, PreventivoInterface } from '../preventivo/preventivo-model';
import { TipologiaCameraInterface } from '../tipologia-camera/tipologia-camera-model';

/**
 * Tipologia con camere libere nelle date cercate. Se non è prenotabile
 * (es. soggiorno minimo) il preventivo è null e non_prenotabile spiega perché.
 */
export interface DisponibilitaInterface {
  tipologia: TipologiaCameraInterface;
  camere_libere: number;
  preventivo: PreventivoInterface | null;
  non_prenotabile: Pick<ErroreApiInterface, 'codice' | 'messaggio'> | null;
}

export interface FiltriDisponibilita extends OspitiPayload {
  /** AAAA-MM-GG */
  arrivo: string;
  /** AAAA-MM-GG */
  partenza: string;
  /** Esclude la camera già bloccata da questa sessione. */
  sessione?: string;
  piano_id?: number;
}

import { CodiceScontoInterface } from '../codice-sconto/codice-sconto-model';
import { PacchettoInterface } from '../pacchetto/pacchetto-model';
import { PromozioneInterface } from '../promozione/promozione-model';

/** Prezzo di una singola notte del soggiorno. */
export interface NottePrezzoInterface {
  /** 'YYYY-MM-DD' */
  data: string;
  prezzo: number;
  /** Nome del periodo tariffario applicato. */
  periodo: string | null;
}

/** Come si è arrivati al prezzo, salvato con la prenotazione dal preventivo. */
export interface DettaglioPrezzoInterface {
  notti: NottePrezzoInterface[];
  promozione: (Pick<PromozioneInterface, 'id' | 'nome'> & { sconto: number }) | null;
  codice_sconto: Pick<CodiceScontoInterface, 'id' | 'codice'> | null;
  pacchetto: Pick<PacchettoInterface, 'id' | 'nome'> | null;
}

import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

/** Cruscotto della reception: arrivi e partenze del giorno, ospiti in casa. */
export interface GiornataInterface {
  /** AAAA-MM-GG */
  giorno: string;
  arrivi: PrenotazioneInterface[];
  partenze: PrenotazioneInterface[];
  in_casa: PrenotazioneInterface[];
}

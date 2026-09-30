import { RequisitiAccessoInterface } from '../requisiti-accesso/requisiti-accesso-model';

/** Voce di menu (staff o sito): compare solo a chi soddisfa gli eventuali requisiti. */
export interface VoceMenuInterface extends RequisitiAccessoInterface {
  /** Chiave di traduzione. */
  etichetta: string;
  percorso: string;
  /** Nome Material Symbols. */
  icona: string;
}

/** Gruppo del menu staff (Oggi, Soggiorni, ...). */
export interface GruppoMenuInterface {
  /** Chiave di traduzione. */
  etichetta: string;
  voci: readonly VoceMenuInterface[];
}

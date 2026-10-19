import type { STATI_RECENSIONE } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { Lingua } from '../lingua/lingua-model';
import { OspiteInterface } from '../ospite/ospite-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
import { AccessoPerCodicePayload, PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { UtenteInterface } from '../utente/utente-model';

export type StatoRecensione = (typeof STATI_RECENSIONE)[number];

/** Recensione di un soggiorno concluso, pubblicata dopo la moderazione. Voti da 1 a 5. */
export interface RecensioneInterface {
  id: number;
  prenotazione_id: number;
  ospite_id: number;
  utente_id: number | null;
  voto: number;
  voto_pulizia: number | null;
  voto_personale: number | null;
  voto_posizione: number | null;
  voto_comfort: number | null;
  voto_qualita_prezzo: number | null;
  titolo: string | null;
  commento: string | null;
  lingua: Lingua;
  /** true = in pubblico solo il nome abbreviato. */
  anonima: boolean;
  stato: StatoRecensione;
  moderata_da: number | null;
  moderata_il: string | null;
  risposta: string | null;
  risposta_da: number | null;
  risposta_il: string | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  ospite?: OspiteInterface;
  prenotazione?: PrenotazioneInterface;
  moderatore?: UtenteInterface | null;
}

type VotiDettaglio =
  'voto_pulizia' | 'voto_personale' | 'voto_posizione' | 'voto_comfort' | 'voto_qualita_prezzo';

/** Sul sito: niente nome completo né dati della prenotazione. */
export type RecensionePubblicaInterface = Pick<
  RecensioneInterface,
  | 'id'
  | 'voto'
  | VotiDettaglio
  | 'titolo'
  | 'commento'
  | 'lingua'
  | 'risposta'
  | 'risposta_il'
  | 'creato_il'
> & {
  /** "Mario R.", null se anonima. */
  autore: string | null;
  paese: string | null;
};

/** Voti di dettaglio facoltativi. */
export type RecensioneCreaPayload = Pick<RecensioneInterface, 'voto'> &
  Partial<Pick<RecensioneInterface, VotiDettaglio | 'titolo' | 'commento' | 'lingua' | 'anonima'>>;

/** Ospite senza account, dal link nell'email. */
export type RecensionePerCodicePayload = AccessoPerCodicePayload & RecensioneCreaPayload;

export interface FiltriRecensioniPubbliche extends ParametriPaginaInterface {
  lingua?: Lingua;
}

export interface FiltriRecensioni extends ParametriPaginaInterface {
  stato?: StatoRecensione;
  /** Per trovare in fretta le recensioni negative. */
  voto_max?: number;
}

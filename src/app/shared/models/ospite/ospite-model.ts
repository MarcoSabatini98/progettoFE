import type { SESSI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { AlloggiatiDocumentoInterface } from '../alloggiati-documento/alloggiati-documento-model';
import { AlloggiatiLuogoInterface } from '../alloggiati-luogo/alloggiati-luogo-model';
import { DocumentoOspiteInterface } from '../documento-ospite/documento-ospite-model';
import { Lingua } from '../lingua/lingua-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
import { PrenotazioneOspiteInterface } from '../prenotazione-ospite/prenotazione-ospite-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';

export type Sesso = (typeof SESSI)[number];

/** Soggiorno passato nella scheda ospite, col ruolo che aveva nella schedina. */
export interface SoggiornoOspiteInterface extends PrenotazioneInterface {
  PrenotazioneOspite: Pick<PrenotazioneOspiteInterface, 'tipo_alloggiato'>;
}

/**
 * Anagrafica di chi soggiorna, con i dati della schedina Alloggiati Web
 * (luoghi e documento con i codici ufficiali). utente_id lo collega all'account, se c'è.
 */
export interface OspiteInterface {
  id: number;
  uuid: string;
  utente_id: number | null;
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  sesso: Sesso | null;
  data_nascita: string | null;
  cittadinanza_codice: string | null;
  stato_nascita_codice: string | null;
  /** Solo per i nati in Italia. */
  comune_nascita_codice: string | null;
  provincia_nascita: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  luogo_rilascio_codice: string | null;
  scadenza_documento: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  cap: string | null;
  citta: string | null;
  provincia: string | null;
  /** Codice ISO a 2 lettere. */
  paese: string | null;
  lingua: Lingua;
  note: string | null;
  creato_il: string;
  aggiornato_il: string;
  eliminato_il: string | null;

  // ─── Associazioni ───
  documenti?: DocumentoOspiteInterface[];
  cittadinanza?: AlloggiatiLuogoInterface | null;
  stato_nascita?: AlloggiatiLuogoInterface | null;
  comune_nascita?: AlloggiatiLuogoInterface | null;
  luogo_rilascio?: AlloggiatiLuogoInterface | null;
  documento_tipo?: AlloggiatiDocumentoInterface | null;
  soggiorni?: SoggiornoOspiteInterface[];
}

/** Scheda dello staff: con i campi che mancano per la schedina Alloggiati Web. */
export interface SchedaOspiteInterface extends OspiteInterface {
  campi_mancanti: (keyof OspiteInterface)[];
  /** Anagrafica di un account cliente: l'email è quella con cui accede e non si cambia qui. */
  cliente_registrato: boolean;
}

/** Dati anagrafici e del documento: gli stessi per gli ospiti e per il profilo del cliente. */
export type AnagraficaPayload = Partial<
  Pick<
    OspiteInterface,
    | 'sesso'
    | 'data_nascita'
    | 'cittadinanza_codice'
    | 'stato_nascita_codice'
    | 'comune_nascita_codice'
    | 'provincia_nascita'
    | 'tipo_documento'
    | 'numero_documento'
    | 'luogo_rilascio_codice'
    | 'scadenza_documento'
    | 'codice_fiscale'
    | 'indirizzo'
    | 'cap'
    | 'citta'
    | 'provincia'
    | 'paese'
  >
>;

export type OspiteCreaPayload = Pick<OspiteInterface, 'nome' | 'cognome'> &
  Partial<Pick<OspiteInterface, 'email' | 'telefono' | 'lingua' | 'note'>> &
  AnagraficaPayload;

export type OspiteAggiornaPayload = Partial<OspiteCreaPayload>;

export interface FiltriOspiti extends ParametriPaginaInterface {
  /** Nome, cognome, email o documento. */
  cerca?: string;
}

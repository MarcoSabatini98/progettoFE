import { FedeltaUtenteInterface } from '../fedelta-utente/fedelta-utente-model';
import { Lingua } from '../lingua/lingua-model';
import { AnagraficaPayload, OspiteInterface } from '../ospite/ospite-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
import { CodiceRuolo, RuoloAssegnabile, RuoloInterface } from '../ruolo/ruolo-model';

/** Account del sito: cliente o membro dello staff. La password non esce mai dall'API. */
export interface UtenteInterface {
  id: number;
  uuid: string;
  email: string;
  ruolo: CodiceRuolo;
  nome: string;
  cognome: string;
  telefono: string | null;
  lingua: Lingua;
  attivo: boolean;
  email_verificata_il: string | null;
  notifiche_email: boolean;
  /** Offerte via email: stato attuale, la prova del consenso resta nel registro del backend. */
  email_marketing: boolean;
  punti_fedelta: number;
  ospite_id: number | null;
  ultimo_accesso_il: string | null;
  /** Colore del cerchio con le iniziali, calcolato dall'uuid (es. 'hsl(210 55% 45%)'). */
  colore_avatar: string | null;
  creato_il: string;
  aggiornato_il: string;
  eliminato_il: string | null;

  // ─── Associazioni ───
  dettagli_ruolo?: RuoloInterface;
  anagrafica?: OspiteInterface | null;
  fedelta?: FedeltaUtenteInterface | null;
}

/** Dati personali dell'area riservata: account e anagrafica restano allineati. */
export type ProfiloAggiornaPayload = Partial<
  Pick<UtenteInterface, 'nome' | 'cognome' | 'telefono' | 'lingua' | 'notifiche_email'>
> &
  AnagraficaPayload;

/** Membro dello staff in un elenco di scelta (es. addetti delle pulizie). */
export type AddettoInterface = Pick<UtenteInterface, 'id' | 'nome' | 'cognome' | 'ruolo'>;

/** Email facoltative che il cliente accende e spegne dal profilo. */
export type PreferenzeEmailInterface = Pick<UtenteInterface, 'notifiche_email' | 'email_marketing'>;

/** Nuovo account staff: l'admin nasce dal seed, i clienti si registrano da soli. */
export type UtenteCreaPayload = Pick<UtenteInterface, 'email' | 'nome' | 'cognome'> &
  Partial<Pick<UtenteInterface, 'telefono' | 'lingua'>> & {
    password: string;
    ruolo: RuoloAssegnabile;
  };

export type UtenteAggiornaPayload = Partial<
  Pick<UtenteInterface, 'nome' | 'cognome' | 'telefono' | 'lingua' | 'attivo'> & {
    ruolo: RuoloAssegnabile;
  }
>;

export interface FiltriUtenti extends ParametriPaginaInterface {
  ruolo?: CodiceRuolo;
  attivo?: boolean;
  /** Nome, cognome o email. */
  cerca?: string;
}

import { FedeltaUtenteInterface } from '../fedelta-utente/fedelta-utente-model';
import { Lingua } from '../lingua/lingua-model';
import { OspiteInterface } from '../ospite/ospite-model';
import { CodiceRuolo, RuoloInterface } from '../ruolo/ruolo-model';

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

import { MessaggioAllegatoInterface } from '../messaggio-allegato/messaggio-allegato-model';
import { UtenteInterface } from '../utente/utente-model';
import { VisitatoreInterface } from '../visitatore/visitatore-model';

/** Messaggio di una conversazione, scritto da un utente, da un visitatore o dal sistema. */
export interface MessaggioInterface {
  id: number;
  conversazione_id: number;
  mittente_utente_id: number | null;
  mittente_visitatore_id: number | null;
  di_sistema: boolean;
  risposta_a_id: number | null;
  testo: string;
  modificato_il: string | null;
  inviato_il: string;
  eliminato_il: string | null;

  // ─── Associazioni ───
  mittente_utente?: UtenteInterface | null;
  mittente_visitatore?: VisitatoreInterface | null;
  allegati?: MessaggioAllegatoInterface[];
}

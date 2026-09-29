import { UtenteInterface } from '../utente/utente-model';

/** Presenza di un utente in una conversazione. uscito_il valorizzato = non ne fa più parte. */
export interface ConversazionePartecipanteInterface {
  conversazione_id: number;
  utente_id: number;
  uscito_il: string | null;
  /** Fin dove ha letto: i messaggi successivi sono non letti. */
  letto_fino_al: string | null;
  entrato_il: string;

  // ─── Associazioni ───
  utente?: UtenteInterface;
}

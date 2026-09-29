import { Lingua } from '../lingua/lingua-model';
import { CodicePermesso } from '../permesso/permesso-model';
import { CodiceRuolo } from '../ruolo/ruolo-model';

/** Utente collegato, come arriva a ogni accesso e rinnovo. */
export interface UtenteSessioneInterface {
  id: number;
  uuid: string;
  email: string;
  nome: string;
  cognome: string;
  ruolo: CodiceRuolo;
  lingua: Lingua;
  colore_avatar: string | null;
  email_verificata: boolean;
  permessi: CodicePermesso[];
}

/** Risposta di accesso, registrazione e rinnovo. Il refresh token resta nel cookie httpOnly. */
export interface SessioneInterface {
  accessToken: string;
  utente: UtenteSessioneInterface;
}

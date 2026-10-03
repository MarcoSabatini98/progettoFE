import { ErroreApiInterface } from '../errore-api/errore-api-model';

/** Conferma del server a un evento mandato dal client (ack), errore come nelle risposte REST. */
export interface EsitoSocketInterface {
  successo: boolean;
  errore?: Pick<ErroreApiInterface, 'codice' | 'messaggio'>;
}

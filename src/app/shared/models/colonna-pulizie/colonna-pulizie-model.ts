import { AttivitaPuliziaInterface } from '../attivita-pulizia/attivita-pulizia-model';

/** Colonna del tabellone delle pulizie: uno stato o un addetto. titolo è una chiave i18n. */
export interface ColonnaPulizieInterface {
  chiave: string;
  titolo: string;
  parametri?: object;
  attivita: AttivitaPuliziaInterface[];
}

/** Attività trascinata, o scelta dal menu, verso un'altra colonna. */
export interface SpostamentoPuliziaInterface {
  attivita: AttivitaPuliziaInterface;
  verso: string;
}

import { CalcoloPrezzo, ServizioInterface } from '../servizio/servizio-model';

/** Extra aggiunto a una prenotazione, col prezzo fissato al momento dell'acquisto. */
export interface PrenotazioneServizioInterface {
  prenotazione_id: number;
  servizio_id: number;
  quantita: number;
  prezzo_unitario: number;
  calcolo_prezzo: CalcoloPrezzo;
  totale: number;

  // ─── Associazioni ───
  servizio?: ServizioInterface;
}

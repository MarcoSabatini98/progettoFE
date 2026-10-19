import { StatoPrenotazione } from '../prenotazione/prenotazione-model';

/**
 * Conti di una prenotazione (vista v_saldo_prenotazioni). saldo negativo = da rimborsare;
 * per le cancellate il dovuto è la penale.
 */
export interface SaldoPrenotazioneInterface {
  /** Assente quando arriva come associazione della prenotazione. */
  prenotazione_id?: number;
  codice?: string | null;
  stato?: StatoPrenotazione | null;
  dovuto: number | null;
  incassato: number | null;
  rimborsato: number | null;
  saldo: number | null;
}

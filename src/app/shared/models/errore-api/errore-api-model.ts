/** Campo rifiutato dalla validazione (es. { campo: 'email', messaggio: '...' }). */
export interface DettaglioErroreInterface {
  campo: string;
  messaggio: string;
}

/**
 * Errore restituito dall'API. codice (es. PRENOTAZIONE_NON_TROVATA) è la chiave
 * da tradurre; messaggio è il testo italiano del backend.
 */
export interface ErroreApiInterface {
  codice: string;
  messaggio: string;
  dettagli?: DettaglioErroreInterface[];
}

/** Corpo di una risposta di errore: { successo: false, errore } */
export interface RispostaErroreApiInterface {
  successo: false;
  errore: ErroreApiInterface;
}

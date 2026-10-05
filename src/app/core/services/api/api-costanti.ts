// Ricerche mentre si scrive: stessi tempi in tutta l'app.

/** Pausa dopo l'ultimo tasto prima di chiedere al backend. */
export const ATTESA_RICERCA_MS = 300;

/** Sotto queste lettere una ricerca per nome non parte. */
export const LETTERE_MINIME_RICERCA = 2;

/** Un anno parte solo intero: mentre si scrive "202" non si cerca. */
export const ANNO_COMPLETO = /^\d{4}$/;

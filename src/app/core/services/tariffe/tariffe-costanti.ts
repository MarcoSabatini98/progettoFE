// Tariffe, sconti e programma fedeltà: stessi valori di progettoBE (tariffe.constants.js).

/** Variazione del piano tariffario rispetto al prezzo del giorno. */
export const TIPI_VARIAZIONE_PIANO = ['percentuale', 'importo'] as const;

/** Variazione di un periodo (stagione): prezzo_fisso sostituisce il prezzo base. */
export const TIPI_VARIAZIONE_PERIODO = ['percentuale', 'importo', 'prezzo_fisso'] as const;

export const TIPI_SCONTO = ['percentuale', 'importo'] as const;

export const MOTIVI_PUNTI = ['soggiorno', 'bonus', 'rettifica', 'annullamento'] as const;

export const PREFERENZE_TEMA = ['sistema', 'chiaro', 'scuro'] as const;

/** Tema scuro del dispositivo, quello che segue la preferenza "sistema". */
export const SCHEMA_SCURO = '(prefers-color-scheme: dark)';

/** Attributo sull'elemento html che forza il tema (vedi src/styles/token.css). */
export const ATTRIBUTO_TEMA = 'data-tema';

/** Colore della struttura accettato (stesso formato di progettoBE). */
export const COLORE_ESADECIMALE = /^#[0-9a-f]{6}$/i;

/** Sopra questa luminosità (0-1) il colore è chiaro e il testo sopra diventa scuro. */
export const SOGLIA_BRAND_CHIARO = 0.6;

/** Testo sui pulsanti e sugli sfondi del colore della struttura. */
export const TESTO_SU_BRAND = { chiaro: '#fff', scuro: '#1b211e' } as const;

/**
 * Scelte dell'interruttore nella barra in alto, con la loro icona Material Symbols.
 * "Automatico" resta solo nelle impostazioni: senza una scelta il sito segue già il dispositivo.
 */
export const ICONE_TEMA = {
  chiaro: 'light_mode',
  scuro: 'dark_mode',
} as const satisfies Partial<Record<(typeof PREFERENZE_TEMA)[number], string>>;

/** Colore della struttura di partenza, lo stesso --bb-brand di src/styles/token.css. */
export const BRAND_PREDEFINITO = '#5e6b3a';

/** Icone della scheda del browser e della schermata home del telefono (src/index.html). */
export const SELETTORE_ICONE = 'link[rel~="icon"], link[rel="apple-touch-icon"]';

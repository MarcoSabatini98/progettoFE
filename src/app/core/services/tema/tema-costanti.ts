export const PREFERENZE_TEMA = ['sistema', 'chiaro', 'scuro'] as const;

/** Attributo sull'elemento html che forza il tema (vedi src/styles/token.css). */
export const ATTRIBUTO_TEMA = 'data-tema';

/** Colore della struttura accettato (stesso formato di progettoBE). */
export const COLORE_ESADECIMALE = /^#[0-9a-f]{6}$/i;

/** Sopra questa luminosità (0-1) il colore è chiaro e il testo sopra diventa scuro. */
export const SOGLIA_BRAND_CHIARO = 0.6;

/** Testo sui pulsanti e sugli sfondi del colore della struttura. */
export const TESTO_SU_BRAND = { chiaro: '#fff', scuro: '#1b211e' } as const;

/** Icona Material Symbols di ogni preferenza nel selettore del tema. */
export const ICONE_TEMA = {
  sistema: 'contrast',
  chiaro: 'light_mode',
  scuro: 'dark_mode',
} as const satisfies Record<(typeof PREFERENZE_TEMA)[number], string>;

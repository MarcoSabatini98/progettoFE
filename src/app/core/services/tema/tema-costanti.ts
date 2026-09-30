export const PREFERENZE_TEMA = ['sistema', 'chiaro', 'scuro'] as const;

/** Attributo sull'elemento html che forza il tema (vedi src/styles/token.css). */
export const ATTRIBUTO_TEMA = 'data-tema';

/** Icona Material Symbols di ogni preferenza nel selettore del tema. */
export const ICONE_TEMA = {
  sistema: 'contrast',
  chiaro: 'light_mode',
  scuro: 'dark_mode',
} as const satisfies Record<(typeof PREFERENZE_TEMA)[number], string>;

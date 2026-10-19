import type { PREFERENZE_TEMA } from '../../../core/services/tema/tema-costanti';

/** Tema scelto dall'utente: "sistema" segue il dispositivo. */
export type PreferenzaTema = (typeof PREFERENZE_TEMA)[number];

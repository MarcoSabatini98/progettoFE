import type { TipoAvviso } from '../../../shared/models/avviso/avviso-model';

export const TIPI_AVVISO = ['successo', 'errore', 'info'] as const;

/** Quanto resta a video un avviso prima di chiudersi da solo. */
export const DURATA_AVVISO_MS = 5000;

/** Icona Material Symbols di ogni tipo di avviso. */
export const ICONE_AVVISO: Record<TipoAvviso, string> = {
  successo: 'check_circle',
  errore: 'error',
  info: 'info',
};

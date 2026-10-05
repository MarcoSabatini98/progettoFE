import type { TipoNotifica } from '../../../shared/models/notifica/notifica-model';

/** Notifiche mostrate nella campanella: le lette si cancellano da sole dopo 90 giorni. */
export const ULTIME_NOTIFICHE = 20;

/** Oltre questo numero il contatore della campanella mostra "99+". */
export const MASSIMO_CONTATORE_NOTIFICHE = 99;

/** Icona Material Symbols per tipo di notifica. */
export const ICONE_NOTIFICA: Record<TipoNotifica, string> = {
  prenotazione: 'event',
  pagamento: 'payments',
  pulizia: 'cleaning_services',
  manutenzione: 'build',
  chat: 'chat',
  recensione: 'reviews',
  sistema: 'info',
};

/** Parametri del titolo che sono date di calendario 'AAAA-MM-GG', da mostrare nella lingua del sito. */
export const PARAMETRI_DATA_NOTIFICA = ['data', 'inizio', 'fine'] as const;

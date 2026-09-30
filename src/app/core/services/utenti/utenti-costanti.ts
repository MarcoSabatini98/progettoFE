/** Limiti dei dati personali (stessi dei validatori di progettoBE). */
export const LUNGHEZZA_DATI_PERSONALI = {
  nome: 100,
  cognome: 100,
  telefono: 30,
} as const;

/** Formati dei documenti d'identità caricabili (stessi di upload.middleware di progettoBE). */
export const FORMATI_DOCUMENTO = 'application/pdf,image/jpeg,image/png,image/webp';

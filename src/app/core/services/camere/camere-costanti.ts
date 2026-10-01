// Camere, tipologie, servizi e media: stessi valori di progettoBE (camere.constants.js).

export const STATI_CAMERA = ['attiva', 'manutenzione', 'fuori_servizio'] as const;

export const STATI_PULIZIA_CAMERA = ['pulita', 'sporca', 'in_pulizia', 'da_ispezionare'] as const;

/** dotazione = inclusa nella camera; extra = acquistabile con la prenotazione */
export const TIPI_SERVIZIO = ['dotazione', 'extra'] as const;

export const CALCOLO_PREZZO = ['a_soggiorno', 'a_notte', 'a_persona', 'a_persona_notte'] as const;

/** A cosa appartiene un'immagine (media.entita). */
export const ENTITA_MEDIA = [
  'camera',
  'tipologia_camera',
  'servizio',
  'pacchetto',
  'struttura',
  'home',
  'logo',
  'varie',
] as const;

// ─── Solo frontend ───

/** Icona Material Symbols per i servizi senza icona scelta dallo staff. */
export const ICONA_SERVIZIO_PREDEFINITA = 'check_circle';

/** Foto accettate dal backend (JPG, PNG, WEBP). */
export const FORMATI_MEDIA = 'image/jpeg,image/png,image/webp';

export const LUNGHEZZA_TESTO_ALTERNATIVO = 255;

export const LUNGHEZZA_TIPOLOGIA = { nome: 100, letti: 100, descrizione: 10_000 } as const;

export const LUNGHEZZA_CAMERA = { numero: 10, nome: 100, note: 5000 } as const;

/** Limiti delle colonne numeriche del database. */
export const LIMITI_CAMERE = {
  ospitiMax: 127,
  superficieMax: 65_535,
  ordineMax: 65_535,
  pianoMin: -128,
  pianoMax: 127,
} as const;

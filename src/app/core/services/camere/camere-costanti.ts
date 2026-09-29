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

/** Chiavi delle impostazioni pubbliche lette dal sito (stesse di progettoBE). */
export const CHIAVI_IMPOSTAZIONI = {
  nome: 'struttura_nome',
  indirizzo: 'struttura_indirizzo',
  cap: 'struttura_cap',
  comune: 'struttura_comune',
  provincia: 'struttura_provincia',
  email: 'struttura_email',
  telefono: 'struttura_telefono',
  cin: 'struttura_cin',
  orarioCheckin: 'orario_checkin',
  orarioCheckout: 'orario_checkout',
  lingueAttive: 'lingue_attive',
  valuta: 'valuta',
  ispezionePulizie: 'pulizie_richiedi_ispezione',
} as const;

/** Valuta dei prezzi se l'impostazione manca (ISO 4217). */
export const VALUTA_PREDEFINITA = 'EUR';

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
  colore: 'aspetto_colore',
  tema: 'aspetto_tema',
  logo: 'aspetto_logo',
  linguaPredefinita: 'lingua_predefinita',
} as const;

/** Campi del gestionale con un controllo apposito; gli altri seguono il tipo dell'impostazione. */
export const CAMPI_IMPOSTAZIONI_SPECIALI = {
  [CHIAVI_IMPOSTAZIONI.colore]: 'colore',
  [CHIAVI_IMPOSTAZIONI.tema]: 'tema',
  [CHIAVI_IMPOSTAZIONI.orarioCheckin]: 'orario',
  [CHIAVI_IMPOSTAZIONI.orarioCheckout]: 'orario',
  [CHIAVI_IMPOSTAZIONI.linguaPredefinita]: 'lingua',
  [CHIAVI_IMPOSTAZIONI.lingueAttive]: 'lingue',
} as const satisfies Record<string, string>;

/** Ordine delle schede nel gestionale; i gruppi non elencati vanno in fondo. */
export const ORDINE_GRUPPI_IMPOSTAZIONI = [
  'struttura',
  'aspetto',
  'localizzazione',
  'soggiorno',
  'prenotazioni',
  'fiscale',
  'fedelta',
  'pulizie',
  'chat',
];

/** Ordine delle voci dentro la scheda; le altre seguono in ordine alfabetico. */
export const ORDINE_VOCI_IMPOSTAZIONI = [
  'struttura_nome',
  'struttura_ragione_sociale',
  'struttura_codice_fiscale',
  'struttura_cin',
  'struttura_partita_iva',
  'struttura_regime_fiscale',
  'struttura_indirizzo',
  'struttura_comune',
  'struttura_provincia',
  'struttura_cap',
  'struttura_telefono',
  'struttura_email',
  'struttura_intestatario_conto',
  'struttura_iban',
];

/** Scheda dopo cui stanno logo e sfondi della home: sono parte dell'aspetto. */
export const GRUPPO_IMMAGINI = 'aspetto';

/** Valuta dei prezzi se l'impostazione manca (ISO 4217). */
export const VALUTA_PREDEFINITA = 'EUR';

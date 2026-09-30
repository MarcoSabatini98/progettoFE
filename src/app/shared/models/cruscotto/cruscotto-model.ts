/** Numeri di oggi per la home dell'admin. Importi in euro. */
export interface CruscottoInterface {
  arrivi_oggi: number;
  partenze_oggi: number;
  in_casa: number;
  /** Camere vendibili (non fuori servizio). */
  camere: number;
  occupazione_oggi: number;
  da_confermare: number;
  manutenzioni_aperte: number;
  recensioni_da_moderare: number;
  /** Pagamenti incassati dal primo del mese, rimborsi sottratti. */
  incassato_mese: number;
  /** Valore dei soggiorni venduti con arrivo dal primo del mese. */
  prenotato_da_inizio_mese: number;
}

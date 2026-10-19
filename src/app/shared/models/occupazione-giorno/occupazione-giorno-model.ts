/** Un giorno del report di occupazione. Importi in euro. */
export interface OccupazioneGiornoInterface {
  /** 'YYYY-MM-DD' */
  giorno: string;
  camere_disponibili: number;
  camere_occupate: number;
  occupazione_percentuale: number;
  ricavo_camere: number;
  prezzo_medio: number;
}

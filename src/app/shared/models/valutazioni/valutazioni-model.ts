/** Medie delle recensioni pubblicate (vista v_valutazioni, una sola riga). */
export interface ValutazioniInterface {
  numero_recensioni: number | null;
  media: number | null;
  media_pulizia: number | null;
  media_personale: number | null;
  media_posizione: number | null;
  media_comfort: number | null;
  media_qualita_prezzo: number | null;
}

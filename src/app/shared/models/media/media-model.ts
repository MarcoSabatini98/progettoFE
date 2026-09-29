import type { ENTITA_MEDIA } from '../../../core/services/camere/camere-costanti';

export type EntitaMedia = (typeof ENTITA_MEDIA)[number];

/** Immagine caricata: appartiene a una camera, tipologia, servizio, pacchetto o al sito. */
export interface MediaInterface {
  id: number;
  entita: EntitaMedia;
  entita_id: number | null;
  percorso: string;
  tipo_mime: string;
  /** Byte. */
  dimensione: number;
  larghezza: number | null;
  altezza: number | null;
  testo_alternativo: string;
  ordine: number;
  creato_il: string;
}

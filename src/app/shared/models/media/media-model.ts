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

/** Senza entita_id: media generici dell'entità (es. galleria della struttura). */
export type FiltriMedia = Pick<MediaInterface, 'entita'> & { entita_id?: number };

/** Multipart: file nel campo "file", JPG, PNG o WEBP. */
export type MediaCreaPayload = Pick<MediaInterface, 'entita'> &
  Partial<Pick<MediaInterface, 'entita_id' | 'testo_alternativo' | 'ordine'>> & { file: File };

export type MediaAggiornaPayload = Partial<
  Pick<MediaInterface, 'ordine'> & { testo_alternativo: string | null }
>;

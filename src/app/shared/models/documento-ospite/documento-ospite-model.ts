/** Scansione del documento d'identità caricata dall'ospite. */
export interface DocumentoOspiteInterface {
  id: number;
  ospite_id: number;
  nome_originale: string;
  percorso: string;
  tipo_mime: string;
  /** Byte. */
  dimensione: number;
  caricato_il: string;
}

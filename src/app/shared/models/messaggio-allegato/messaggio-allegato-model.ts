/** File allegato a un messaggio della chat. */
export interface MessaggioAllegatoInterface {
  id: number;
  messaggio_id: number;
  nome_originale: string;
  percorso: string;
  tipo_mime: string;
  /** Byte. */
  dimensione: number;
  creato_il: string;
}

import { Observable } from 'rxjs';

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

/** Chiamate sui documenti: del profilo per il cliente, dell'anagrafica per lo staff. */
export interface AzioniDocumentiInterface {
  carica(file: File): Observable<unknown>;
  scarica(id: number): Observable<Blob>;
  elimina(id: number): Observable<unknown>;
}

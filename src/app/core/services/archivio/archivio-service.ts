import { DOCUMENT, Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ArchivioService {
  private readonly archivio = inject(DOCUMENT).defaultView?.localStorage;

  /**
   * LEGGI
   * Restituisce il valore salvato solo se è tra quelli ammessi:
   * un valore manomesso o di una versione precedente viene ignorato.
   */
  leggi<T extends string>(chiave: string, ammessi: readonly T[]): T | null {
    const salvato = this.archivio?.getItem(chiave);
    return ammessi.find((valore) => valore === salvato) ?? null;
  }

  /**
   * LEGGI TESTO
   * Per i valori liberi (es. un token), che non hanno un elenco di ammessi.
   */
  leggiTesto(chiave: string): string | null {
    return this.archivio?.getItem(chiave) ?? null;
  }

  /**
   * SCRIVI
   */
  scrivi(chiave: string, valore: string): void {
    this.archivio?.setItem(chiave, valore);
  }

  /**
   * ELIMINA
   */
  elimina(chiave: string): void {
    this.archivio?.removeItem(chiave);
  }
}

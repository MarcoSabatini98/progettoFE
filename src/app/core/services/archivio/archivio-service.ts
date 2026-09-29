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
   * SCRIVI
   */
  scrivi(chiave: string, valore: string): void {
    this.archivio?.setItem(chiave, valore);
  }
}

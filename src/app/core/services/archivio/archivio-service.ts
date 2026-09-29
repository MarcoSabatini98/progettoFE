import { DOCUMENT, Injectable, inject } from '@angular/core';

/** Preferenze salvate sul dispositivo (localStorage), sempre validate in lettura. */
@Injectable({ providedIn: 'root' })
export class ArchivioService {
  private readonly archivio = inject(DOCUMENT).defaultView?.localStorage;

  /** Restituisce il valore salvato solo se è tra quelli ammessi. */
  leggi<T extends string>(chiave: string, ammessi: readonly T[]): T | null {
    const salvato = this.archivio?.getItem(chiave);
    return ammessi.find((valore) => valore === salvato) ?? null;
  }

  scrivi(chiave: string, valore: string): void {
    this.archivio?.setItem(chiave, valore);
  }
}

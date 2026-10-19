import { Injectable, signal } from '@angular/core';

import { AvvisoInterface, TipoAvviso } from '../../../shared/models/avviso/avviso-model';
import { DURATA_AVVISO_MS } from './avvisi-costanti';

/**
 * Avvisi in sovrimpressione: li mostra app-avvisi, montato una sola volta in App.
 */
@Injectable({
  providedIn: 'root',
})
export class AvvisiService {
  private readonly elenco = signal<AvvisoInterface[]>([]);
  private ultimoId = 0;

  readonly avvisi = this.elenco.asReadonly();

  /**
   * MOSTRA
   * Aggiunge un avviso che si chiude da solo dopo DURATA_AVVISO_MS.
   */
  mostra(testo: string, tipo: TipoAvviso = 'info'): void {
    const id = ++this.ultimoId;
    this.elenco.update((avvisi) => [...avvisi, { id, testo, tipo }]);
    setTimeout(() => this.chiudi(id), DURATA_AVVISO_MS);
  }

  /**
   * CHIUDI
   */
  chiudi(id: number): void {
    this.elenco.update((avvisi) => avvisi.filter((avviso) => avviso.id !== id));
  }
}

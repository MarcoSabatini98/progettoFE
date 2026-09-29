import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

import { PreferenzaTema } from '../../../shared/models/tema/tema-model';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ArchivioService } from '../archivio/archivio-service';
import { ATTRIBUTO_TEMA, PREFERENZE_TEMA } from './tema-costanti';

@Injectable({
  providedIn: 'root',
})
export class TemaService {
  private readonly archivio = inject(ArchivioService);
  private readonly radice = inject(DOCUMENT).documentElement;
  private readonly preferenzaCorrente = signal<PreferenzaTema>(
    this.archivio.leggi(CHIAVI_ARCHIVIO.tema, PREFERENZE_TEMA) ?? 'sistema',
  );

  /**
   * Tema scelto. Priorità: localStorage → "sistema" (segue il dispositivo).
   */
  readonly preferenza = this.preferenzaCorrente.asReadonly();

  constructor() {
    this.applica(this.preferenza());
  }

  /**
   * IMPOSTA
   * Salva la scelta sul dispositivo e la applica subito.
   */
  imposta(preferenza: PreferenzaTema): void {
    this.preferenzaCorrente.set(preferenza);
    this.archivio.scrivi(CHIAVI_ARCHIVIO.tema, preferenza);
    this.applica(preferenza);
  }

  /**
   * Con "sistema" l'attributo viene tolto e decide color-scheme del dispositivo;
   * altrimenti l'attributo forza chiaro o scuro (vedi src/styles/token.css).
   */
  private applica(preferenza: PreferenzaTema): void {
    if (preferenza === 'sistema') {
      this.radice.removeAttribute(ATTRIBUTO_TEMA);
    } else {
      this.radice.setAttribute(ATTRIBUTO_TEMA, preferenza);
    }
  }
}

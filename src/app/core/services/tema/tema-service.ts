import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

import { CHIAVI_ARCHIVIO } from '../../costanti/archiviazione-costanti';
import { ATTRIBUTO_TEMA, PREFERENZE_TEMA } from '../../costanti/tema-costanti';
import type { PreferenzaTema } from '../../../shared/models/tema/tema-model';
import { ArchivioService } from '../archivio/archivio-service';

/**
 * Tema chiaro/scuro. Con "sistema" l'attributo viene tolto e decide il dispositivo
 * tramite color-scheme; altrimenti l'attributo forza la scelta (vedi styles/token.css).
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly archivio = inject(ArchivioService);
  private readonly radice = inject(DOCUMENT).documentElement;
  private readonly preferenzaCorrente = signal<PreferenzaTema>(
    this.archivio.leggi(CHIAVI_ARCHIVIO.tema, PREFERENZE_TEMA) ?? 'sistema',
  );

  readonly preferenza = this.preferenzaCorrente.asReadonly();

  constructor() {
    this.applica(this.preferenza());
  }

  imposta(preferenza: PreferenzaTema): void {
    this.preferenzaCorrente.set(preferenza);
    this.archivio.scrivi(CHIAVI_ARCHIVIO.tema, preferenza);
    this.applica(preferenza);
  }

  private applica(preferenza: PreferenzaTema): void {
    if (preferenza === 'sistema') this.radice.removeAttribute(ATTRIBUTO_TEMA);
    else this.radice.setAttribute(ATTRIBUTO_TEMA, preferenza);
  }
}

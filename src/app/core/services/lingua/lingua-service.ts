import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TranslocoService, type Translation } from '@jsverse/transloco';
import type { Observable } from 'rxjs';

import { CHIAVI_ARCHIVIO } from '../../costanti/archiviazione-costanti';
import { LINGUA_PREDEFINITA, LINGUE } from '../../costanti/lingue-costanti';
import type { Lingua } from '../../../shared/models/lingua/lingua-model';
import { ArchivioService } from '../archivio/archivio-service';

/** Lingua del sito: scelta salvata, poi lingua del browser, poi italiano. */
@Injectable({ providedIn: 'root' })
export class LinguaService {
  private readonly transloco = inject(TranslocoService);
  private readonly archivio = inject(ArchivioService);
  private readonly documento = inject(DOCUMENT);
  private readonly linguaCorrente = signal<Lingua>(this.linguaIniziale());

  readonly attiva = this.linguaCorrente.asReadonly();

  constructor() {
    this.applica(this.attiva());
  }

  /** Scarica le traduzioni della lingua attiva: usato all'avvio per evitare testi vuoti. */
  carica(): Observable<Translation> {
    return this.transloco.load(this.attiva());
  }

  imposta(lingua: Lingua): void {
    this.linguaCorrente.set(lingua);
    this.archivio.scrivi(CHIAVI_ARCHIVIO.lingua, lingua);
    this.applica(lingua);
  }

  private applica(lingua: Lingua): void {
    this.transloco.setActiveLang(lingua);
    this.documento.documentElement.lang = lingua;
  }

  private linguaIniziale(): Lingua {
    const browser = this.documento.defaultView?.navigator.language.slice(0, 2);
    return (
      this.archivio.leggi(CHIAVI_ARCHIVIO.lingua, LINGUE) ??
      LINGUE.find((lingua) => lingua === browser) ??
      LINGUA_PREDEFINITA
    );
  }
}

import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { Translation, TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { Lingua } from '../../../shared/models/lingua/lingua-model';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ArchivioService } from '../archivio/archivio-service';
import { CHIAVI_IMPOSTAZIONI } from '../impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../impostazioni/impostazioni-service';
import { LINGUA_PREDEFINITA, LINGUE } from './lingua-costanti';

@Injectable({
  providedIn: 'root',
})
export class LinguaService {
  private readonly transloco = inject(TranslocoService);
  private readonly archivio = inject(ArchivioService);
  private readonly documento = inject(DOCUMENT);
  private readonly impostazioni = inject(ImpostazioniService);
  private readonly linguaCorrente = signal<Lingua>(this.linguaIniziale());

  /**
   * Lingua del sito. Priorità: localStorage → lingua del browser → italiano.
   */
  readonly attiva = this.linguaCorrente.asReadonly();

  /**
   * Lingue offerte nel selettore: quelle attivate dall'admin (lingue_attive), tutte se non c'è l'impostazione.
   */
  readonly disponibili = computed<readonly Lingua[]>(() => {
    const attive = this.impostazioni.pubbliche()[CHIAVI_IMPOSTAZIONI.lingueAttive];
    return Array.isArray(attive) ? LINGUE.filter((lingua) => attive.includes(lingua)) : LINGUE;
  });

  constructor() {
    this.applica(this.attiva());
  }

  /**
   * CARICA
   * Scarica le traduzioni della lingua attiva: usato all'avvio per evitare testi vuoti.
   */
  carica(): Observable<Translation> {
    return this.transloco.load(this.attiva());
  }

  /**
   * IMPOSTA
   * Salva la scelta sul dispositivo e la applica subito.
   */
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

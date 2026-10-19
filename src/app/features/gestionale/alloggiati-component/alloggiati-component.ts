import { DOCUMENT, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AlloggiatiService } from '../../../core/services/alloggiati/alloggiati-service';
import { salvaFile } from '../../../core/services/api/salva-file';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PREFISSO_FILE_ALLOGGIATI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { SchedineAlloggiatiComponent } from '../schedine-alloggiati-component/schedine-alloggiati-component';

/**
 * Alloggiati Web: soggiorni degli ultimi giorni ancora da comunicare, file da caricare
 * sul portale per quelli scelti e, per ognuno, le schedine con l'esito da registrare.
 */
@Component({
  selector: 'app-alloggiati',
  imports: [RouterLink, TranslocoPipe, IconaComponent, DataPipe, SchedineAlloggiatiComponent],
  templateUrl: './alloggiati-component.html',
  styleUrl: './alloggiati-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class AlloggiatiComponent {
  private readonly documento = inject(DOCUMENT);
  private readonly alloggiati = inject(AlloggiatiService);
  protected readonly errori = inject(ErroriService);

  protected readonly prenotazioni = PERCORSI_STAFF.prenotazioni;
  protected readonly daInviare = rxResource({ stream: () => this.alloggiati.elencaDaInviare() });
  /** Soggiorni da mettere nel file: all'inizio tutti quelli da inviare. */
  protected readonly scelti = linkedSignal(() =>
    this.daInviare.hasValue() ? this.daInviare.value().map((soggiorno) => soggiorno.id) : [],
  );
  /** Soggiorno di cui si vedono le schedine. */
  protected readonly aperto = signal<number | undefined>(undefined);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * SCEGLI
   * Mette o toglie un soggiorno dal file.
   */
  scegli(id: number, scelto: boolean): void {
    this.scelti.update((ids) => (scelto ? [...ids, id] : ids.filter((altro) => altro !== id)));
  }

  /**
   * APRI
   * Mostra le schedine del soggiorno, o le richiude.
   */
  apri(id: number): void {
    this.aperto.update((attuale) => (attuale === id ? undefined : id));
  }

  /**
   * SCARICA
   * File del tracciato ufficiale per i soggiorni scelti; rifiutato se a qualche ospite mancano dati.
   */
  scarica(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.alloggiati
      .scaricaFile(this.scelti())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (file) => salvaFile(this.documento, file, nomeFile()),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}

/** Es. alloggiati_2030-06-01.txt, come lo chiama il backend. */
function nomeFile(): string {
  return `${PREFISSO_FILE_ALLOGGIATI}_${formatDate(new Date(), 'yyyy-MM-dd', 'en')}.txt`;
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { DocumentiIdentitaComponent } from '../../../shared/documenti-identita-component/documenti-identita-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { AzioniDocumentiInterface } from '../../../shared/models/documento-ospite/documento-ospite-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { DatiOspiteComponent } from '../dati-ospite-component/dati-ospite-component';

/**
 * Scheda di un ospite per lo staff: cosa manca alla schedina Alloggiati Web,
 * anagrafica, documenti d'identità, soggiorni ed eliminazione.
 */
@Component({
  selector: 'app-scheda-ospite',
  imports: [
    RouterLink,
    TranslocoPipe,
    DataPipe,
    DatiOspiteComponent,
    DocumentiIdentitaComponent,
    IconaComponent,
  ],
  templateUrl: './scheda-ospite-component.html',
  styleUrl: './scheda-ospite-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaOspiteComponent {
  private readonly ospiti = inject(OspitiService);
  private readonly router = inject(Router);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.ospiti;
  protected readonly prenotazioni = PERCORSI_STAFF.prenotazioni;
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.ospiti.leggiOspite(id),
  });
  protected readonly azioni: AzioniDocumentiInterface = {
    carica: (file) => this.ospiti.caricaDocumento(this.id(), file),
    scarica: (id) => this.ospiti.scaricaDocumento(id),
    elimina: (id) => this.ospiti.eliminaDocumento(id),
  };
  protected readonly daEliminare = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * ELIMINA
   * Solo dopo la conferma; chi ha già soggiornato resta per gli obblighi di legge.
   */
  elimina(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.ospiti
      .eliminaOspite(this.id())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.elenco),
        error: (errore: unknown) => {
          this.daEliminare.set(false);
          this.errore.set(this.errori.messaggio(errore));
        },
      });
  }
}

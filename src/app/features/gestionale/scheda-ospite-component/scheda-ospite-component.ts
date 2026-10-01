import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { DocumentiIdentitaComponent } from '../../../shared/documenti-identita-component/documenti-identita-component';
import { EliminaComponent } from '../elimina-component/elimina-component';
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
    EliminaComponent,
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
  /** Chi ha già soggiornato resta per gli obblighi di legge: il backend lo rifiuta. */
  protected readonly elimina = () => this.ospiti.eliminaOspite(this.id());

  protected tornaAllElenco(): void {
    void this.router.navigateByUrl(this.elenco);
  }
}

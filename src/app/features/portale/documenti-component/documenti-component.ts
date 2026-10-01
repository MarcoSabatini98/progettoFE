import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { DocumentiIdentitaComponent } from '../../../shared/documenti-identita-component/documenti-identita-component';
import { AzioniDocumentiInterface } from '../../../shared/models/documento-ospite/documento-ospite-model';

/** Documenti d'identità del cliente: li carica una volta e valgono per i check-in. */
@Component({
  selector: 'app-documenti',
  imports: [TranslocoPipe, DocumentiIdentitaComponent],
  templateUrl: './documenti-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sezione' },
})
export class DocumentiComponent {
  private readonly utenti = inject(UtentiService);

  protected readonly profilo = rxResource({ stream: () => this.utenti.leggiProfilo() });
  protected readonly azioni: AzioniDocumentiInterface = {
    carica: (file) => this.utenti.caricaDocumento(file),
    scarica: (id) => this.utenti.scaricaDocumento(id),
    elimina: (id) => this.utenti.eliminaDocumento(id),
  };
}

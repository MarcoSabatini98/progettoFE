import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { statoPagine } from '../../../core/services/api/stato-pagine';
import { RegistroService } from '../../../core/services/registro/registro-service';
import { TabellaRegistro } from '../../../shared/models/registro-attivita/registro-attivita-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { RigaRegistroComponent } from '../riga-registro-component/riga-registro-component';

/** Storia di una prenotazione o di una fattura nella sua scheda: chi l'ha cambiata e come. Solo admin. */
@Component({
  selector: 'app-storia-record',
  imports: [TranslocoPipe, PaginazioneComponent, RigaRegistroComponent],
  templateUrl: './storia-record-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class StoriaRecordComponent {
  private readonly registro = inject(RegistroService);
  protected readonly errori = inject(ErroriService);

  readonly tabella = input.required<TabellaRegistro>();
  readonly recordId = input.required<number>();

  /** Cambiando record si riparte dalla prima pagina. */
  protected readonly pagine = statoPagine(() => [this.tabella(), this.recordId()]);
  protected readonly storia = rxResource({
    params: () => ({
      tabella: this.tabella(),
      id: this.recordId(),
      pagina: this.pagine.pagina(),
      perPagina: this.pagine.perPagina(),
    }),
    stream: ({ params: { tabella, id, ...pagina } }) =>
      this.registro.leggiStoria(tabella, id, pagina),
  });
}

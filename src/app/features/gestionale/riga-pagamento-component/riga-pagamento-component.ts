import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PagamentoInterface } from '../../../shared/models/pagamento/pagamento-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Movimento in un elenco: importo (in uscita per i rimborsi), tipo e metodo, quando,
 * prenotazione e stato, con il collegamento alla scheda della prenotazione. Stessa riga delle pulizie.
 */
@Component({
  selector: 'app-riga-pagamento',
  imports: [RouterLink, TranslocoPipe, DataPipe, PrezzoPipe],
  templateUrl: './riga-pagamento-component.html',
  styleUrl: '../riga-pulizia-component/riga-pulizia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaPagamentoComponent {
  readonly pagamento = input.required<PagamentoInterface>();

  protected readonly scheda = PERCORSI_STAFF.prenotazioni;
}

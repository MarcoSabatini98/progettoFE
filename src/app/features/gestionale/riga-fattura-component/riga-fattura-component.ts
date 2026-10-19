import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Fattura o nota di credito in un elenco: totale, numero (o bozza), intestatario,
 * data e stato SDI, con il collegamento alla sua scheda. Stessa riga delle pulizie.
 */
@Component({
  selector: 'app-riga-fattura',
  imports: [RouterLink, TranslocoPipe, DataPipe, PrezzoPipe],
  templateUrl: './riga-fattura-component.html',
  styleUrl: '../riga-pulizia-component/riga-pulizia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaFatturaComponent {
  readonly fattura = input.required<FatturaInterface>();

  protected readonly scheda = PERCORSI_STAFF.fatture;
}

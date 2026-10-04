import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { RecensioneInterface } from '../../../shared/models/recensione/recensione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/** Lunghezza dell'anteprima del commento quando manca il titolo. */
const ANTEPRIMA = 80;

/**
 * Recensione in un elenco: voto, titolo (o l'inizio del commento), ospite, quando
 * e stato della moderazione, con il collegamento alla scheda. Stessa riga delle pulizie.
 */
@Component({
  selector: 'app-riga-recensione',
  imports: [RouterLink, SlicePipe, TranslocoPipe, DataPipe, IconaComponent],
  templateUrl: './riga-recensione-component.html',
  styleUrl: '../riga-pulizia-component/riga-pulizia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaRecensioneComponent {
  readonly recensione = input.required<RecensioneInterface>();

  protected readonly scheda = PERCORSI_STAFF.recensioni;
  protected readonly anteprima = ANTEPRIMA;
}

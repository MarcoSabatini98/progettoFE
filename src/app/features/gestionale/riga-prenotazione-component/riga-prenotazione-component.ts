import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/**
 * Prenotazione in un elenco dello staff: camera, titolare, date e stato, con il collegamento
 * alla scheda. Le azioni rapide si proiettano sotto.
 */
@Component({
  selector: 'app-riga-prenotazione',
  imports: [RouterLink, TranslocoPipe, DataPipe],
  templateUrl: './riga-prenotazione-component.html',
  styleUrl: './riga-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaPrenotazioneComponent {
  readonly prenotazione = input.required<PrenotazioneInterface>();

  protected readonly scheda = PERCORSI_STAFF.prenotazioni;
}

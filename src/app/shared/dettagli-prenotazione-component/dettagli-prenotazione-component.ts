import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconaComponent } from '../icona-component/icona-component';
import { PrenotazioneInterface } from '../models/prenotazione/prenotazione-model';
import { DataPipe } from '../pipes/data-pipe';

/** Scheda di una prenotazione: stato, camera, date, ospiti e scadenza del pagamento. */
@Component({
  selector: 'app-dettagli-prenotazione',
  imports: [TranslocoPipe, IconaComponent, DataPipe],
  templateUrl: './dettagli-prenotazione-component.html',
  styleUrl: './dettagli-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class DettagliPrenotazioneComponent {
  readonly prenotazione = input.required<PrenotazioneInterface>();
}

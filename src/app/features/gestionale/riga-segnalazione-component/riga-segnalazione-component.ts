import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { SegnalazioneManutenzioneInterface } from '../../../shared/models/segnalazione-manutenzione/segnalazione-manutenzione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/** Priorità segnalate sulla riga: le altre non distraggono. */
const PRIORITA_EVIDENTI = new Set(['alta', 'urgente']);

/**
 * Segnalazione in un elenco: camera (o area comune), cosa non va, quando e chi
 * se ne occupa, con il collegamento alla scheda. Stessa riga delle pulizie.
 */
@Component({
  selector: 'app-riga-segnalazione',
  imports: [RouterLink, TranslocoPipe, DataPipe, IconaComponent],
  templateUrl: './riga-segnalazione-component.html',
  styleUrl: '../riga-pulizia-component/riga-pulizia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaSegnalazioneComponent {
  readonly segnalazione = input.required<SegnalazioneManutenzioneInterface>();

  protected readonly scheda = PERCORSI_STAFF.manutenzione;
  protected readonly evidente = computed(() => PRIORITA_EVIDENTI.has(this.segnalazione().priorita));
}

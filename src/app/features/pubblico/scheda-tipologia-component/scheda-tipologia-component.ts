import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/** Scheda di una tipologia nelle griglie del sito: foto, ospiti, superficie e prezzo di partenza. */
@Component({
  selector: 'app-scheda-tipologia',
  imports: [RouterLink, TranslocoPipe, IconaComponent, MediaPipe, PrezzoPipe],
  templateUrl: './scheda-tipologia-component.html',
  styleUrl: './scheda-tipologia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedaTipologiaComponent {
  readonly tipologia = input.required<TipologiaCameraInterface>();

  protected readonly dettaglio = computed(() => [PERCORSI_PUBBLICI.camere, this.tipologia().slug]);
  /** Le foto arrivano già in ordine: la prima fa da copertina. */
  protected readonly copertina = computed(() => this.tipologia().media?.[0]);
}

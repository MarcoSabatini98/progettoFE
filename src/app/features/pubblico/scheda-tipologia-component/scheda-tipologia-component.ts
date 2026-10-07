import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Scheda di una tipologia nelle griglie del sito: foto, ospiti, superficie e prezzo di partenza.
 * Con la camera è la scheda di quella camera: porta alla sua pagina e usa le sue foto,
 * se ne ha, altrimenti quelle della tipologia.
 */
@Component({
  selector: 'app-scheda-tipologia',
  imports: [RouterLink, TranslocoPipe, IconaComponent, MediaPipe, PrezzoPipe],
  templateUrl: './scheda-tipologia-component.html',
  styleUrl: './scheda-tipologia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedaTipologiaComponent {
  readonly tipologia = input.required<TipologiaCameraInterface>();
  readonly camera = input<CameraInterface>();

  protected readonly dettaglio = computed(() => {
    const percorso = [PERCORSI_PUBBLICI.camere, this.tipologia().slug];
    const camera = this.camera();
    return camera ? [...percorso, camera.numero] : percorso;
  });
  protected readonly ospiti = computed(
    () => this.camera()?.ospiti_max ?? this.tipologia().ospiti_max,
  );
  /** Le foto arrivano già in ordine: la prima fa da copertina. */
  protected readonly copertina = computed(
    () => this.camera()?.media?.[0] ?? this.tipologia().media?.[0],
  );
}

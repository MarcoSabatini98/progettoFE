import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';

/**
 * Descrizione, numeri e dotazioni di una tipologia; con la camera anche piano,
 * ospiti propri e le dotazioni che ha in più.
 */
@Component({
  selector: 'app-dettagli-camera',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './dettagli-camera-component.html',
  styleUrl: './dettagli-camera-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DettagliCameraComponent {
  readonly tipologia = input.required<TipologiaCameraInterface>();
  readonly camera = input<CameraInterface>();

  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
  /** La camera può ospitare meno persone della tipologia (null = come la tipologia). */
  protected readonly ospiti = computed(
    () => this.camera()?.ospiti_max ?? this.tipologia().ospiti_max,
  );
  /** Quelle della tipologia e poi quelle in più della camera, senza ripetizioni. */
  protected readonly dotazioni = computed(() => {
    const tutte = [...(this.tipologia().servizi ?? []), ...(this.camera()?.servizi ?? [])];
    return [...new Map(tutte.map((servizio) => [servizio.id, servizio])).values()];
  });
}

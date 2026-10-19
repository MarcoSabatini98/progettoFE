import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';

/**
 * Colonna principale della pagina di una camera: descrizione, numeri in riquadri con
 * icone grandi e tutte le dotazioni (#dotazioni, dove porta il link "+N altre").
 * Senza descrizione propria la camera mostra quella della tipologia; le dotazioni
 * sono sempre quelle della tipologia: ogni sua camera le ha.
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
  protected readonly descrizione = computed(
    () => this.camera()?.descrizione || this.tipologia().descrizione,
  );
  protected readonly dotazioni = computed(() => this.tipologia().servizi ?? []);
}

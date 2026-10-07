import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { DettagliCameraComponent } from '../dettagli-camera-component/dettagli-camera-component';

/**
 * Pagina di una camera (/camere/:slug/:numero): foto grande e, se ce n'è più d'una,
 * le miniature per sfogliarle; numeri, dotazioni, camere vicine della stessa tipologia
 * e la prenotazione proprio di questa camera.
 */
@Component({
  selector: 'app-camera',
  imports: [
    RouterLink,
    TranslocoPipe,
    IconaComponent,
    MediaPipe,
    PrezzoPipe,
    DettagliCameraComponent,
  ],
  templateUrl: './camera-component.html',
  styleUrl: './camera-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class CameraComponent {
  private readonly camere = inject(CamereService);
  private readonly lingua = inject(LinguaService);

  /** Dal percorso. */
  readonly slug = input.required<string>();
  readonly numero = input.required<string>();

  protected readonly percorsoCamere = PERCORSI_PUBBLICI.camere;
  protected readonly percorsoPrenota = PERCORSI_PUBBLICI.prenota;
  /** La tipologia porta tutte le sue camere: da lì la camera e le sue vicine. */
  protected readonly tipologia = rxResource({
    params: () => ({ slug: this.slug(), lingua: this.lingua.attiva() }),
    stream: ({ params }) => this.camere.leggiTipologiaPubblica(params.slug),
  });
  protected readonly vicine = computed(() => {
    const camere = this.tipologia.hasValue() ? (this.tipologia.value().camere ?? []) : [];
    const indice = camere.findIndex((camera) => camera.numero === this.numero());
    if (indice < 0) return {};
    return {
      camera: camere[indice],
      precedente: camere[indice - 1],
      successiva: camere[indice + 1],
    };
  });
  /** Senza foto proprie la camera mostra quelle della tipologia. */
  protected readonly foto = computed(() => {
    const proprie = this.vicine().camera?.media ?? [];
    return proprie.length || !this.tipologia.hasValue()
      ? proprie
      : (this.tipologia.value().media ?? []);
  });
  /** Si riparte dalla prima foto quando si passa a un'altra camera. */
  protected readonly attiva = linkedSignal({ source: this.foto, computation: () => 0 });
}

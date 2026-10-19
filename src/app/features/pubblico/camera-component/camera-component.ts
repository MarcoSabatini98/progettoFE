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

import {
  DOTAZIONI_IN_EVIDENZA,
  ICONA_SERVIZIO_PREDEFINITA,
} from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { CondizioniSoggiornoComponent } from '../condizioni-soggiorno-component/condizioni-soggiorno-component';
import { DettagliCameraComponent } from '../dettagli-camera-component/dettagli-camera-component';
import { ServiziExtraComponent } from '../servizi-extra-component/servizi-extra-component';

/**
 * Pagina di una camera (/camere/:slug/:numero): foto grande e, se ce n'è più d'una,
 * le miniature per sfogliarle; accanto titolo, prezzo, prenotazione di questa camera e
 * le prime dotazioni. Sotto descrizione e dettagli con, a lato, le condizioni del
 * soggiorno; poi i servizi extra e le altre camere della stessa tipologia.
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
    CondizioniSoggiornoComponent,
    ServiziExtraComponent,
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
  /** La tipologia porta tutte le sue camere: da lì questa camera e le altre. */
  protected readonly tipologia = rxResource({
    params: () => ({ slug: this.slug(), lingua: this.lingua.attiva() }),
    stream: ({ params }) => this.camere.leggiTipologiaPubblica(params.slug),
  });
  private readonly tutte = computed(() =>
    this.tipologia.hasValue() ? (this.tipologia.value().camere ?? []) : [],
  );
  protected readonly camera = computed(() =>
    this.tutte().find((camera) => camera.numero === this.numero()),
  );
  protected readonly altre = computed(() =>
    this.tutte().filter((camera) => camera.numero !== this.numero()),
  );
  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
  /** Le dotazioni sono della tipologia: sotto Prenota le prime, le altre in #dotazioni. */
  private readonly dotazioni = computed(() =>
    this.tipologia.hasValue() ? (this.tipologia.value().servizi ?? []) : [],
  );
  protected readonly inEvidenza = computed(() => this.dotazioni().slice(0, DOTAZIONI_IN_EVIDENZA));
  protected readonly altreDotazioni = computed(
    () => this.dotazioni().length - this.inEvidenza().length,
  );
  /** Senza foto proprie la camera mostra quelle della tipologia. */
  protected readonly foto = computed(() => {
    const proprie = this.camera()?.media ?? [];
    return proprie.length || !this.tipologia.hasValue()
      ? proprie
      : (this.tipologia.value().media ?? []);
  });
  /** Si riparte dalla prima foto quando si passa a un'altra camera. */
  protected readonly attiva = linkedSignal({ source: this.foto, computation: () => 0 });
}

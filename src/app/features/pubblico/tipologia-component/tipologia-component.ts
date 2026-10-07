import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { CaroselloComponent } from '../carosello-component/carosello-component';
import { DettagliCameraComponent } from '../dettagli-camera-component/dettagli-camera-component';
import { SchedaTipologiaComponent } from '../scheda-tipologia-component/scheda-tipologia-component';

/**
 * Dettaglio di una tipologia (/camere/:slug): foto nel carosello (ferma se è una sola),
 * descrizione, letti, dotazioni incluse e le sue camere, ognuna con la propria pagina.
 */
@Component({
  selector: 'app-tipologia',
  imports: [
    RouterLink,
    TranslocoPipe,
    IconaComponent,
    MediaPipe,
    PrezzoPipe,
    CaroselloComponent,
    DettagliCameraComponent,
    SchedaTipologiaComponent,
  ],
  templateUrl: './tipologia-component.html',
  styleUrl: './tipologia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class TipologiaComponent {
  private readonly camere = inject(CamereService);
  private readonly lingua = inject(LinguaService);

  /** Slug dal percorso. */
  readonly slug = input.required<string>();

  protected readonly percorsoCamere = PERCORSI_PUBBLICI.camere;
  protected readonly percorsoPrenota = PERCORSI_PUBBLICI.prenota;
  protected readonly tipologia = rxResource({
    params: () => ({ slug: this.slug(), lingua: this.lingua.attiva() }),
    stream: ({ params }) => this.camere.leggiTipologiaPubblica(params.slug),
  });
}

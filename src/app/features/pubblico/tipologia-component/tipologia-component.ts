import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CopertinaComponent } from '../copertina-component/copertina-component';
import { RiquadroCameraComponent } from '../riquadro-camera-component/riquadro-camera-component';

/**
 * Una tipologia (/camere/:slug): copertina con la sua foto, nome e descrizione, poi un
 * riquadro per ognuna delle sue camere, con le dotazioni della tipologia, la prenotazione
 * proprio di quella camera e il link alla sua pagina.
 */
@Component({
  selector: 'app-tipologia',
  imports: [RouterLink, TranslocoPipe, IconaComponent, CopertinaComponent, RiquadroCameraComponent],
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
